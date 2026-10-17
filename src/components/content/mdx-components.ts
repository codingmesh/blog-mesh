import Aside from './Aside.astro';
import Figure from './Figure.astro';
import OutcomeExplorer from './OutcomeExplorer.astro';
import Transcript from './Transcript.astro';
import Turn from './Turn.astro';
import Video from './Video.astro';

/**
 * Components available to every MDX entry without an import line. Keystatic declares the same names.
 * `img` replaces Markdown image syntax with a captioned figure.
 */
export const mdxComponents = { Aside, OutcomeExplorer, Transcript, Turn, Video, img: Figure };
