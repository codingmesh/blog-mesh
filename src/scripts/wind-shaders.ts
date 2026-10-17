/**
 * The wind shaders, adapted from egoist/mygo/examples/wind (MIT; see /third-party-notices.txt) by way of its
 * Motion Lab port. The field pass computes the wind at two samples a cell; the glyph pass draws the characters
 * it lights. Folio's change is the calm reading column in place of the original's calm card.
 */
const vertex = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
const common = `
precision highp float;
precision highp int;
uniform uint Seed;
uniform float Time, Now;
uniform int TapCount;
uniform vec4 Taps[6];
const float tau = 6.2831853;
uint pcg(uint v) {
  uint s = v * 747796405u + 2891336453u;
  uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u;
  return (w >> 22u) ^ w;
}
float unit(uint h) { return float(h >> 8u) / 16777216.0; }
float heart(vec2 u) {
  float k = -u.x*u.x*u.y*u.y*u.y;
  float c = sign(k) * pow(abs(k), 1.0/3.0);
  float r = 1.0;
  for (int i=0; i<6; i++) r = sqrt(max(0.05, 1.0+c*pow(r, 5.0/3.0)));
  return r;
}
float reachAt(vec2 p, vec4 tap) {
  vec2 away = p-tap.xy;
  float d = length(away);
  return tap.w < 0.0 ? d/heart(away/max(d,1.0)) : d;
}
float frontAt(float behind, float age) {
  float width = 85.0+60.0*age;
  return smoothstep(-16.0,10.0,behind)*exp(-behind*behind/(width*width));
}
`;
const field = `#version 300 es
${common}
uniform float Reveal, Carried, Span, GustLength, GustWidth, Bend, BendScale;
uniform vec2 Heading, PaneSize, Origin, Step;
// Folio: the reading column is calm. Column = (center x, half width, feather, floor).
uniform vec4 Column;
uniform int WakeCount;
uniform vec4 Wakes[48], Ways[48];
out vec4 color;
vec3 quintic(vec3 f) { return f*f*f*(f*(f*6.0-15.0)+10.0); }
float corner(uint h) { return unit(pcg(h))*2.0-1.0; }
float value(vec3 p, uint salt) {
  vec3 fl=floor(p), w=quintic(p-fl);
  uint x0=uint(int(fl.x)), x1=uint(int(fl.x)+1);
  uint y0=uint(int(fl.y)), y1=uint(int(fl.y)+1);
  uint z0=pcg(uint(int(fl.z))^Seed^salt), z1=pcg(uint(int(fl.z)+1)^Seed^salt);
  uint a=pcg(y0^z0), b=pcg(y1^z0), c=pcg(y0^z1), d=pcg(y1^z1);
  return mix(
    mix(mix(corner(x0^a),corner(x1^a),w.x),mix(corner(x0^b),corner(x1^b),w.x),w.y),
    mix(mix(corner(x0^c),corner(x1^c),w.x),mix(corner(x0^d),corner(x1^d),w.x),w.y),w.z);
}
vec3 slope(uint h) {
  uint k=pcg(h);
  return vec3(float(k&1023u),float((k>>10u)&1023u),float((k>>20u)&1023u))*(2.0/1023.0)-1.0;
}
float swirl(vec3 p, uint salt) {
  vec3 fl=floor(p), f=p-fl, w=quintic(f);
  uint x0=uint(int(fl.x)), x1=uint(int(fl.x)+1);
  uint y0=uint(int(fl.y)), y1=uint(int(fl.y)+1);
  uint z0=pcg(uint(int(fl.z))^Seed^salt), z1=pcg(uint(int(fl.z)+1)^Seed^salt);
  uint a=pcg(y0^z0), b=pcg(y1^z0), c=pcg(y0^z1), d=pcg(y1^z1);
  return 1.5*mix(
    mix(mix(dot(slope(x0^a),f),dot(slope(x1^a),f-vec3(1,0,0)),w.x),
        mix(dot(slope(x0^b),f-vec3(0,1,0)),dot(slope(x1^b),f-vec3(1,1,0)),w.x),w.y),
    mix(mix(dot(slope(x0^c),f-vec3(0,0,1)),dot(slope(x1^c),f-vec3(1,0,1)),w.x),
        mix(dot(slope(x0^d),f-vec3(0,1,1)),dot(slope(x1^d),f-vec3(1)),w.x),w.y),w.z);
}
float gusts(vec2 at) {
  float gain=mix(0.38,0.62,0.6), gust=0.0, weight=1.0, power=0.0;
  vec2 size=vec2(0.85*GustLength,0.75*GustWidth);
  for (int i=0;i<4;i++) {
    float k=float(i);
    gust+=weight*swirl(vec3((at.x-Carried*(1.0+0.1*k))/size.x,at.y/size.y,3.0*Time*(0.03+0.018*k)+11.0*k),0x60u+uint(i));
    power+=weight*weight; weight*=gain; size*=vec2(0.5,0.58);
  }
  float strand=1.0-abs(swirl(vec3((at.x-1.15*Carried)/(0.7*GustLength),at.y/(0.95*GustWidth),3.0*Time*0.05+2.0),0x66u));
  float swell=cos((at.x-Carried+0.5*Span*value(vec3(Time*0.045,at.y/(2.5*GustWidth),7),0x67u))*(tau/Span));
  return gust*inversesqrt(power)+0.25*(strand*strand*strand-0.35)+0.3*swell;
}
vec4 taps(vec2 p) {
  vec4 sum=vec4(0);
  for (int i=0;i<6;i++) {
    if(i>=TapCount) break;
    vec4 tap=Taps[i];
    float age=Now-tap.z;
    vec2 away=p-tap.xy;
    float d=length(away), behind=620.0*(1.0-exp(-age/1.3))-reachAt(p,tap);
    float swell=abs(tap.w)*exp(-age/1.5)*frontAt(behind,age);
    sum.xy+=away/max(d,1.0)*(44.0*swell);
    sum.z+=1.9*swell*(0.25+0.75*cos(behind*(tau/130.0)));
    sum.w+=swell;
  }
  return sum;
}
float warmth(vec2 p) {
  float w=0.0;
  for(int i=0;i<48;i++) {
    if(i>=WakeCount) break;
    vec4 wake=Wakes[i]; vec3 way=Ways[i].xyz;
    vec2 away=p-wake.xy;
    away-=way.xy*clamp(dot(away,way.xy),-way.z,way.z);
    w+=wake.z*exp(-dot(away,away)*wake.w);
  }
  return 1.0-exp(-1.5*w);
}
void main() {
  vec2 p=Origin+gl_FragCoord.xy*Step;
  vec4 hand=vec4(0); float warm=0.0;
  if(TapCount+WakeCount>0) {
    vec2 near=p+24.0*vec2(value(vec3(p/95.0,Now*0.12),0x71u),value(vec3(p/95.0+9.1,Now*0.12+4.0),0x72u));
    hand=taps(near); warm=warmth(near); hand.zw+=vec2(0.25,0.05)*warm;
  }
  vec2 from=p-hand.xy;
  vec2 turn=vec2(value(vec3(from/BendScale,Time*0.04),0x51u),value(vec3(from/BendScale+17.3,Time*0.04+5.0),0x52u));
  vec2 bent=from+Bend*turn, across=vec2(-Heading.y,Heading.x);
  vec2 q=vec2(dot(bent,Heading),dot(bent,across));
  vec2 riding=vec2(q.x-0.85*Carried,q.y);
  float eddySize=1.15*GustWidth, fineSize=0.38*GustWidth;
  vec2 eddy=vec2(swirl(vec3(riding/eddySize,3.0*Time*0.04),0x59u),swirl(vec3(riding/eddySize+31.7,3.0*Time*0.04+3.0),0x5au));
  vec2 folded=riding+0.65*0.9*GustWidth*eddy;
  vec2 fine=vec2(swirl(vec3(folded/fineSize,3.0*Time*0.06),0x5bu),swirl(vec3(folded/fineSize+13.1,3.0*Time*0.06+7.0),0x5cu));
  vec2 creased=(folded+0.3*GustWidth*fine)/24.0;
  vec2 tiny=vec2(swirl(vec3(creased,Time*0.07),0x5du),swirl(vec3(creased+5.3,Time*0.07+1.0),0x5eu));
  vec2 pull=0.65*(1.0+0.9*min(hand.w,1.5))*(GustWidth*(0.9*eddy+0.3*fine)+0.6*30.0*tiny);
  vec2 curled=q+pull;
  vec2 blows=normalize(Heading+0.6*turn+hand.xy/14.0+0.65*((0.45*eddy.x+0.25*fine.x)*Heading+(0.45*eddy.y+0.25*fine.y)*across));
  float still=gusts(curled), field=still+hand.z;
  float level=mix(0.02,0.82,0.5), band=mix(0.26,0.03,0.75);
  bool blowing=field>level-band-0.55*0.35;
  float strength=0.0, streaks=0.0;
  if(blowing || warm>0.0) {
    float thread=value(vec3((curled.x-Carried*1.6)/140.0,curled.y/30.0,Time*0.16),0x57u);
    streaks=1.0-smoothstep(0.0,0.5,abs(thread));
  }
  if(blowing) {
    float ahead=gusts(curled+vec2(56,0));
    float leaving=smoothstep(-0.05,0.07,ahead-still);
    float lit=smoothstep(level-band-0.55*0.35*leaving,level+band,field);
    float broad=lit*lit*mix(0.45,1.0,clamp((field-level)/0.45,0.0,1.0))*(0.82+0.18*fine.y);
    strength=broad*mix(1.0,0.25+0.95*streaks,0.4);
  }
  if(warm>0.0) {
    float grain=0.55*fine.y+0.45*tiny.x+0.3*(streaks-0.4);
    strength=1.0-(1.0-strength)*(1.0-0.85*warm*smoothstep(-0.5,0.25,grain));
  }
  float outside=max(0.0,abs(p.x-Column.x)-Column.y);
  float calm=mix(Column.w,1.0,smoothstep(0.0,Column.z,outside));
  float shown=max(Reveal,min(1.0,2.0*hand.w+warm));
  color=vec4(strength*calm*shown,blows*0.5+0.5,calm*shown);
}`;
const glyphs = `#version 300 es
${common}
uniform sampler2D Field, Atlas;
uniform vec2 Resolution, PixelOrigin;
uniform vec4 Grid, Cells;
uniform int Seq[64], SeqLen;
uniform vec3 Ink, Glow;
uniform float Opacity;
out vec4 color;
vec3 clickLight(vec2 p) {
  float roused=0.0; vec2 glow=vec2(0);
  for(int i=0;i<6;i++) {
    if(i>=TapCount) break;
    vec4 tap=Taps[i]; float age=Now-tap.z;
    float behind=620.0*(1.0-exp(-age/1.3))-reachAt(p,tap);
    float front=frontAt(behind,age);
    roused+=abs(tap.w)*exp(-age/1.5)*front;
    float trail=smoothstep(0.0,70.0,behind)*exp(-max(behind,0.0)/260.0);
    glow.x+=abs(tap.w)*(exp(-age)*front+0.7*exp(-age/1.3)*trail);
    glow.y+=abs(tap.w)*(1.0-exp(-age/0.2))*exp(-age/1.2)*trail;
  }
  return vec3(roused,glow);
}
float inkAt(vec2 home, vec2 at) {
  return texelFetch(Atlas,ivec2(home+clamp(at,vec2(0),Grid.xy-1.0)),0).a;
}
void main() {
  vec2 px=floor(vec2(gl_FragCoord.x,Resolution.y-gl_FragCoord.y)-PixelOrigin);
  vec2 cell=floor(px/Grid.xy), at=px-cell*Grid.xy;
  int cx=int(cell.x), cy=int(cell.y);
  if(cx<0 || cy<0 || cx>=int(Grid.z) || cy>=int(Grid.w)) { color=vec4(0); return; }
  uint h=pcg(uint(cx)*0x9E3779B9u^pcg(uint(cy)^Seed)), pace=pcg(h);
  int steps=int(floor(Time*1.2*(0.6+0.8*unit(pace))+unit(pcg(pace))));
  vec2 glow=vec2(0);
  if(TapCount>0) {
    vec3 light=clickLight(Cells.xy+cell*Cells.zw);
    steps+=int(floor(6.0*light.x+unit(pcg(pace^0x33u))));
    glow=light.yz*(0.65+0.35*unit(pcg(pace^0x51u)));
  }
  int i=(int(h>>8u)+steps)%SeqLen, g=Seq[i];
  vec2 home=vec2(float(g%16),float(g/16))*Grid.xy;
  float ink=inkAt(home,at);
  if(ink<=0.0) { color=vec4(0); return; }
  vec2 sampleAt=vec2((px.x+0.5)/Grid.x,(px.y+0.5)/(Grid.y/2.0));
  vec4 wind=texture(Field,sampleAt/vec2(textureSize(Field,0)));
  vec2 blows=wind.gb*2.0-1.0;
  vec2 rise=vec2(inkAt(home,at+vec2(1,0))-inkAt(home,at-vec2(1,0)),inkAt(home,at+vec2(0,1))-inkAt(home,at-vec2(0,1)));
  float steep=length(rise), facing=0.35;
  if(steep>0.02) facing=max(0.0,dot(rise/steep,blows));
  float caught=mix(1.0,0.45+1.1*facing,0.6);
  float light=min(1.0,wind.r*caught)+0.03*wind.a;
  float tint=smoothstep(0.04,0.3,glow.x);
  float bright=min(1.0,light)*mix(1.0,3.0,tint), left=0.3*glow.y*wind.a;
  float alpha=ink*min(1.0,(bright+left)/3.0);
  vec3 c=(mix(Ink,Glow,tint)*bright+Glow*left)/(bright+left+0.0001)*alpha;
  color=vec4(c,alpha)*Opacity;
}`;
export const WIND_SHADERS = { vertex, field, glyphs };
