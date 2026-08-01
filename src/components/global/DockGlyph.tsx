import type { IconType } from 'react-icons';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import {
  LuBlocks,
  LuChartSpline,
  LuContactRound,
  LuFileText,
  LuGlobe,
  LuHistory,
  LuLink2,
  LuMail,
  LuNetwork,
  LuNewspaper,
  LuNotebookPen,
  LuSquareTerminal,
} from 'react-icons/lu';

type GlyphName =
  | 'browser'
  | 'workbench'
  | 'notes'
  | 'evolution'
  | 'timeline'
  | 'agents'
  | 'news'
  | 'network'
  | 'links'
  | 'contact'
  | 'linkedin'
  | 'github'
  | 'mail';

type Props = {
  name: GlyphName;
  className?: string;
};

const glyphs: Record<GlyphName, IconType> = {
  browser: LuGlobe,
  workbench: LuBlocks,
  notes: LuNotebookPen,
  evolution: LuChartSpline,
  timeline: LuHistory,
  agents: LuSquareTerminal,
  news: LuNewspaper,
  network: LuNetwork,
  links: LuLink2,
  contact: LuContactRound,
  linkedin: FaLinkedin,
  github: FaGithub,
  mail: LuMail,
};

export default function DockGlyph({ name, className = '' }: Props) {
  const Glyph = glyphs[name] ?? LuFileText;
  return <Glyph className={className} aria-hidden="true" focusable="false" />;
}
