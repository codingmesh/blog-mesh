/**
 * The wind in the margins: a field of small monospace characters that the wind lights as it passes, with the
 * reading column kept calm. Adapted from the Motion Lab port of egoist/mygo/examples/wind (MIT; see
 * /third-party-notices.txt). Loaded lazily by Wind.astro only on wide pointer devices without a reduced-motion
 * preference, so phones and most readers never download it.
 */
import { WIND_SHADERS } from './wind-shaders.ts';

type Tap = { x: number; y: number; at: number; force: number };
type Wake = Tap & { dx: number; dy: number; half: number };
type Point = { x: number; y: number; at: number };
type Program = { p: WebGLProgram; loc(name: string): WebGLUniformLocation | null };
type Grid = {
  w: number;
  h: number;
  width: number;
  height: number;
  scale: number;
  cellW: number;
  cellH: number;
  cols: number;
  rows: number;
  left: number;
  top: number;
};

const looks = [
  'ab0cAde1fEgh2iGjk3lHmn4oKpq5rMst6uRvw7xSyz8nT9eW',
  'abcd3efgRhijk7lmnAopqr0stuEvwxy5zaeKiou2gcS9',
  '0a1b2C3d4e5F6g7h8i9J0k1m2N3p4q5R6s7t8U9v0w1X2y3z',
];
const charset = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '·';
/** Glyph ink is the muted token; the ripples glow in the accent. */
const palettes = {
  light: { ink: [0.416, 0.404, 0.373], glow: [0.122, 0.42, 0.31], opacity: 0.8 },
  dark: { ink: [0.608, 0.592, 0.553], glow: [0.435, 0.749, 0.616], opacity: 0.7 },
};
/** The wind blows for this many seconds after the last thing the reader did, then settles. */
const budget = 180;

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
};
const palette = () => (document.documentElement.dataset.theme === 'dark' ? palettes.dark : palettes.light);
const overControl = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest('a,button,input,textarea,[data-calm]');

class Wind {
  private gl!: WebGL2RenderingContext;
  private resources?: {
    field: Program;
    glyphs: Program;
    fieldTexture: WebGLTexture;
    atlasTexture: WebGLTexture;
    framebuffer: WebGLFramebuffer;
    vao: WebGLVertexArrayObject;
  };
  private grid?: Grid;
  private wind!: {
    heading: [number, number];
    speed: number;
    length: number;
    width: number;
    bend: number;
    bendScale: number;
  };
  private seed = 0;
  private look = -1;
  private time = 0;
  private windTime = 24;
  private last: number | null = null;
  private frame: number | null = null;
  private lastPaint = -Infinity;
  private taps: Tap[] = [];
  private wakes: Wake[] = [];
  private clicks = 0;
  private pointer: Point | null = null;
  private from: Point | null = null;
  private speed = 0;
  private lastActivity = 0;
  private lost = false;
  private failed = false;
  private readonly abort = new AbortController();

  constructor(
    readonly canvas: HTMLCanvasElement,
    public column: Element,
    /** The page head (hero or page-head); the field is strongest around it. */
    public head: Element | null,
  ) {
    const { signal } = this.abort;
    window.addEventListener('pointermove', (ev) => this.onMove(ev), { passive: true, signal });
    window.addEventListener('pointerdown', (ev) => this.onDown(ev), { passive: true, signal });
    window.addEventListener(
      'pointerout',
      (ev) => {
        if (!ev.relatedTarget) this.pointer = this.from = null;
      },
      { signal },
    );
    // Resizes arrive in bursts; the canvas and atlas are rebuilt once per frame at most.
    let resizing = false;
    window.addEventListener(
      'resize',
      () => {
        if (resizing) return;
        resizing = true;
        requestAnimationFrame(() => {
          resizing = false;
          this.guard(() => this.resize());
        });
      },
      { signal },
    );
    window.addEventListener('scroll', () => this.invalidate(), { passive: true, signal });
    document.addEventListener(
      'visibilitychange',
      () => {
        this.cancel();
        if (!document.hidden) this.invalidate();
      },
      { signal },
    );
    document.addEventListener('themechange', () => this.invalidate(), { signal });
    canvas.addEventListener(
      'webglcontextlost',
      (ev) => {
        ev.preventDefault();
        this.lost = true;
        this.cancel();
      },
      { signal },
    );
    canvas.addEventListener(
      'webglcontextrestored',
      () => {
        this.lost = false;
        this.resources = undefined;
        this.guard(() => this.init());
      },
      { signal },
    );
    this.reseed();
    this.guard(() => this.init());
  }

  /**
   * Stops rendering and releases the GPU objects. The context itself is kept: a canvas only ever gets one, so
   * losing it would leave the same canvas unusable if the wind is mounted on it again after a resize.
   */
  destroy() {
    this.abort.abort();
    this.cancel();
    if (this.resources) {
      const gl = this.gl;
      gl.deleteProgram(this.resources.field.p);
      gl.deleteProgram(this.resources.glyphs.p);
      gl.deleteTexture(this.resources.fieldTexture);
      gl.deleteTexture(this.resources.atlasTexture);
      gl.deleteFramebuffer(this.resources.framebuffer);
      gl.deleteVertexArray(this.resources.vao);
    }
    this.resources = undefined;
    this.canvas.hidden = true;
  }

  /** Called after a client-side navigation that kept the canvas: the column and head elements are new. */
  refresh(column: Element, head: Element | null) {
    this.column = column;
    this.head = head;
    this.wake();
  }

  private guard(action: () => void) {
    try {
      action();
    } catch (error) {
      this.fail(error);
    }
  }
  private fail(error: unknown) {
    console.error('Wind:', error);
    this.failed = true;
    this.cancel();
    this.canvas.hidden = true;
  }
  private cancel() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.last = null;
  }

  private compile(type: number, source: string) {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message ?? 'Shader failed to compile');
    }
    return shader;
  }
  private program(source: string): Program {
    const gl = this.gl;
    const vs = this.compile(gl.VERTEX_SHADER, WIND_SHADERS.vertex);
    const fs = this.compile(gl.FRAGMENT_SHADER, source);
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      throw new Error(message ?? 'Program failed to link');
    }
    const uniforms = new Map<string, WebGLUniformLocation | null>();
    return {
      p,
      loc: (name) => {
        if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(p, name));
        return uniforms.get(name)!;
      },
    };
  }
  private texture(filter: number) {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }
  private init() {
    const gl = this.canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
    });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
    this.resources = {
      field: this.program(WIND_SHADERS.field),
      glyphs: this.program(WIND_SHADERS.glyphs),
      fieldTexture: this.texture(gl.LINEAR),
      atlasTexture: this.texture(gl.NEAREST),
      framebuffer: gl.createFramebuffer()!,
      vao: gl.createVertexArray()!,
    };
    gl.bindVertexArray(this.resources.vao);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    this.failed = false;
    this.grid = undefined;
    this.canvas.hidden = false;
    this.resize();
  }

  /** The glyph atlas: sixteen characters to a row, each in a cell twice as tall as wide. */
  private buildAtlas(cellW: number, scale: number) {
    const gl = this.gl;
    const sheet = document.createElement('canvas');
    sheet.width = 16 * cellW;
    sheet.height = Math.ceil(charset.length / 16) * cellW * 2;
    const ctx = sheet.getContext('2d')!;
    ctx.font = `400 ${Math.round(9 * scale)}px "JetBrains Mono", Menlo, Consolas, monospace`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < charset.length; i++) {
      const x = (i % 16) * cellW;
      const y = Math.floor(i / 16) * cellW * 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cellW, cellW * 2);
      ctx.clip();
      ctx.fillText(charset[i], x + cellW / 2, y + cellW + 0.5);
      ctx.restore();
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.resources!.atlasTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);
  }
  private resize() {
    if (this.failed || this.lost || !this.resources) return;
    const gl = this.gl;
    const width = innerWidth;
    const height = innerHeight;
    // Capped at four million pixels so dense screens do not pay without limit.
    const scale = Math.min(devicePixelRatio || 1, 2, Math.sqrt(4e6 / (width * height)));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const cellW = Math.max(5, Math.round(6.5 * scale));
    const cellH = 2 * cellW;
    const cols = Math.ceil(w / cellW);
    const rows = Math.ceil(h / cellH);
    const atlasChanged = !this.grid || this.grid.cellW !== cellW || this.grid.scale !== scale;
    this.canvas.width = w;
    this.canvas.height = h;
    this.grid = {
      w,
      h,
      width,
      height,
      scale,
      cellW,
      cellH,
      cols,
      rows,
      left: Math.round((w - cols * cellW) / 2),
      top: Math.round((h - rows * cellH) / 2),
    };
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.resources.fieldTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, 2 * rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.resources.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.resources.fieldTexture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Incomplete wind framebuffer');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (atlasChanged) this.buildAtlas(cellW, scale);
    this.invalidate();
  }

  /** Each visit gets its own wind: heading, speed, gust size, and the characters it shows. */
  private reseed() {
    this.seed = crypto.getRandomValues(new Uint32Array(1))[0];
    this.look = (this.look + 1 + (this.seed % 2)) % looks.length;
    let n = this.seed;
    const next = () => {
      n ^= n << 13;
      n ^= n >>> 17;
      n ^= n << 5;
      return (n >>> 0) / 4294967296;
    };
    const between = (lo: number, hi: number) => lo + (hi - lo) * next();
    let angle = between(Math.PI / 10, Math.PI / 4.3);
    if (next() > 0.5) angle = Math.PI - angle;
    this.wind = {
      heading: [Math.cos(angle), Math.sin(angle)],
      speed: between(42, 64),
      length: between(380, 560),
      width: between(120, 190),
      bend: between(60, 110),
      bendScale: between(300, 440),
    };
    this.windTime = between(15, 60);
    this.taps.length = this.wakes.length = 0;
    this.clicks = 0;
    this.pointer = this.from = null;
    this.lastActivity = this.time;
  }

  private uploadHand(p: Program) {
    const gl = this.gl;
    const taps = new Float32Array(24);
    this.taps.forEach((tap, i) => taps.set([tap.x, tap.y, tap.at, tap.force], i * 4));
    gl.uniform1ui(p.loc('Seed'), this.seed);
    gl.uniform1f(p.loc('Time'), this.windTime);
    gl.uniform1f(p.loc('Now'), this.time);
    gl.uniform1i(p.loc('TapCount'), this.taps.length);
    gl.uniform4fv(p.loc('Taps[0]'), taps);
  }
  private render() {
    if (!this.grid || !this.resources || this.failed || this.lost) return;
    const gl = this.gl;
    const { w, h, scale, cellW, cellH, cols, rows, left, top, width, height } = this.grid;
    const wind = this.wind;
    gl.bindVertexArray(this.resources.vao);

    // Pass one: the wind field, two samples a cell.
    const f = this.resources.field;
    gl.useProgram(f.p);
    this.uploadHand(f);
    const wakes = new Float32Array(48 * 4);
    const ways = new Float32Array(48 * 4);
    this.wakes.forEach((wake, i) => {
      const age = this.time - wake.at;
      const reach = 50 + 40 * age;
      const heat = wake.force * (1 - Math.exp(-age / 0.05)) * Math.exp(-age / 0.65);
      wakes.set([wake.x, wake.y, heat, 1 / (reach * reach)], i * 4);
      ways.set([wake.dx, wake.dy, wake.half, 0], i * 4);
    });
    gl.uniform1i(f.loc('WakeCount'), this.wakes.length);
    gl.uniform4fv(f.loc('Wakes[0]'), wakes);
    gl.uniform4fv(f.loc('Ways[0]'), ways);
    gl.uniform1f(f.loc('Reveal'), 1 - smooth((this.time - this.lastActivity - budget) / 8));
    gl.uniform2fv(f.loc('Heading'), wind.heading);
    gl.uniform1f(f.loc('Carried'), wind.speed * this.windTime);
    gl.uniform1f(
      f.loc('Span'),
      Math.max(1, 0.58 * (Math.abs(wind.heading[0]) * width + Math.abs(wind.heading[1]) * height)),
    );
    gl.uniform1f(f.loc('GustLength'), wind.length);
    gl.uniform1f(f.loc('GustWidth'), wind.width);
    gl.uniform1f(f.loc('Bend'), wind.bend);
    gl.uniform1f(f.loc('BendScale'), wind.bendScale);
    gl.uniform2f(f.loc('Origin'), left / scale, top / scale);
    gl.uniform2f(f.loc('Step'), cellW / scale, cellH / 2 / scale);
    gl.uniform2f(f.loc('PaneSize'), width, height);
    // One field with two soft masks. The reading column dims to about a tenth over a 320px fade so the glyphs
    // stay behind the headline rather than through it; the field is strongest around the page head and settles
    // to about a third below it; ripples pass through both.
    const rect = this.column.getBoundingClientRect();
    gl.uniform4f(f.loc('Column'), rect.x + rect.width / 2, rect.width / 2 + 24, 320, 0.1);
    const head = (this.head ?? this.column).getBoundingClientRect();
    gl.uniform4f(f.loc('Head'), head.bottom + 48, 260, 0.35, 0.6);
    gl.uniform1f(f.loc('Pass'), 0.9);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.resources.framebuffer);
    gl.viewport(0, 0, cols, 2 * rows);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Pass two: the glyphs, lit by the field.
    const g = this.resources.glyphs;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(g.p);
    this.uploadHand(g);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.resources.fieldTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.resources.atlasTexture);
    gl.uniform1i(g.loc('Field'), 0);
    gl.uniform1i(g.loc('Atlas'), 1);
    gl.uniform2f(g.loc('Resolution'), w, h);
    gl.uniform2f(g.loc('PixelOrigin'), left, top);
    gl.uniform4f(g.loc('Grid'), cellW, cellH, cols, rows);
    gl.uniform4f(
      g.loc('Cells'),
      (left + cellW * 0.5) / scale,
      (top + cellH * 0.5) / scale,
      cellW / scale,
      cellH / scale,
    );
    const sequence = new Int32Array(64);
    const chars = looks[this.look];
    Array.from(chars).forEach((ch, i) => {
      sequence[i] = charset.indexOf(ch);
    });
    gl.uniform1iv(g.loc('Seq[0]'), sequence);
    gl.uniform1i(g.loc('SeqLen'), chars.length);
    const colors = palette();
    gl.uniform3fv(g.loc('Ink'), colors.ink);
    gl.uniform3fv(g.loc('Glow'), colors.glow);
    gl.uniform1f(g.loc('Opacity'), colors.opacity);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.canvas.dataset.renderer = 'webgl2';
  }

  private tick = (timestamp: number) => {
    this.frame = null;
    if (document.hidden || this.failed || this.lost) {
      this.last = null;
      return;
    }
    // Thirty frames a second at rest, sixty while a ripple or a warm trail is alive.
    const interval = this.taps.length || this.wakes.length ? 1000 / 60 : 1000 / 30;
    if (timestamp - this.lastPaint < interval - 1) {
      this.frame = requestAnimationFrame(this.tick);
      return;
    }
    const dt = this.last === null ? 0 : Math.min(0.1, (timestamp - this.last) / 1000);
    this.last = timestamp;
    this.lastPaint = timestamp;
    this.time += dt;
    this.windTime += dt * (1 - smooth((this.time - this.lastActivity - budget) / 8));
    this.taps = this.taps.filter((t) => this.time - t.at < 3.6);
    this.wakes = this.wakes.filter((t) => this.time - t.at < 2.4);
    try {
      this.render();
    } catch (error) {
      this.fail(error);
      return;
    }
    if (this.time - this.lastActivity < budget + 8) this.frame = requestAnimationFrame(this.tick);
    else this.last = null;
  };
  private invalidate() {
    if (!this.resources || this.failed || this.lost || document.hidden) return;
    this.lastPaint = -Infinity;
    if (this.frame === null) this.frame = requestAnimationFrame(this.tick);
  }
  private wake() {
    this.lastActivity = this.time;
    this.invalidate();
  }

  /** A moving pointer warms the air along its path, more the faster it goes. */
  private onMove(ev: PointerEvent) {
    if (!this.resources || overControl(ev.target) || ev.pointerType === 'touch') {
      this.pointer = this.from = null;
      return;
    }
    this.wake();
    const now = performance.now() / 1000;
    const point = { x: ev.clientX, y: ev.clientY, at: now };
    const previous = this.pointer;
    this.pointer = point;
    if (!previous || !this.from || now - previous.at > 0.25) {
      this.from = point;
      this.speed = 0;
      return;
    }
    const dt = Math.max(1 / 240, now - previous.at);
    this.speed += (Math.hypot(point.x - previous.x, point.y - previous.y) / dt - this.speed) * Math.min(1, dt / 0.08);
    const dx = point.x - this.from.x;
    const dy = point.y - this.from.y;
    const length = Math.hypot(dx, dy);
    if (length < 18 || now - this.from.at < 0.035) return;
    const force = (smooth((this.speed - 60) / 740) * length) / (length + 90);
    if (force > 0.002) {
      this.wakes.push({
        x: (point.x + this.from.x) / 2,
        y: (point.y + this.from.y) / 2,
        at: this.time,
        force,
        dx: dx / length,
        dy: dy / length,
        half: length / 2,
      });
      this.wakes = this.wakes.slice(-48);
    }
    this.from = point;
  }
  /** A click on empty paper is a blow that runs outward; every third one is a heart. */
  private onDown(ev: PointerEvent) {
    if (!this.resources || ev.button !== 0 || overControl(ev.target)) return;
    this.wake();
    this.clicks++;
    this.taps.push({ x: ev.clientX, y: ev.clientY, at: this.time, force: this.clicks % 3 === 0 ? -1.15 : 1 });
    this.taps = this.taps.slice(-6);
  }
}

let current: Wind | undefined;

/** Starts the wind on `canvas`, or hands a persisted canvas its new page's column. */
export async function mountWind(canvas: HTMLCanvasElement) {
  const column = document.querySelector('.wrap');
  if (!column) return;
  const head = document.querySelector('.hero, .page-head');
  if (current?.canvas === canvas) {
    current.refresh(column, head);
    return;
  }
  current?.destroy();
  await document.fonts.load('9px "JetBrains Mono"').catch(() => undefined);
  current = new Wind(canvas, column, head);
}

export function unmountWind() {
  current?.destroy();
  current = undefined;
}
