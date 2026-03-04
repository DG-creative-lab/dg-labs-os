import DraggableWindow from './DraggableWindow';
import {
  IoCodeSlash,
  IoCompassOutline,
  IoHelpCircleOutline,
  IoTerminalOutline,
} from 'react-icons/io5';

export type HelpTopic = 'user-guide' | 'terminal-guide' | 'navigation-tips' | 'about-os';

interface HelpGuideWindowProps {
  isOpen: boolean;
  topic: HelpTopic | null;
  onClose: () => void;
}

const TOPICS: Record<
  HelpTopic,
  {
    title: string;
    subtitle: string;
    icon: 'guide' | 'terminal' | 'navigation' | 'about';
    sections: Array<{ heading: string; bullets: string[] }>;
  }
> = {
  'user-guide': {
    title: 'DG-Labs User Guide',
    subtitle: 'Operating manual for the cognitive OS metaphor',
    icon: 'guide',
    sections: [
      {
        heading: 'Module Map',
        bullets: [
          'Workbench: production systems and platform builds.',
          'Network: knowledge graph of education, experience, research, and projects.',
          'Agents Terminal: command surface for deterministic actions plus LLM reasoning.',
          'Timeline: canonical resume module with downloadable formats.',
          'Lab Notes: research threads and implementation principles.',
        ],
      },
      {
        heading: 'How It Operates',
        bullets: [
          'Facts are stored as structured modules; ideas are links between modules.',
          'The dock is for fast module switching; the menu bar is context-aware by active window.',
          'Windows can be moved/resized to match your reading and comparison workflow.',
        ],
      },
      {
        heading: 'Recommended Flow',
        bullets: [
          'Start in Workbench for systems overview.',
          'Open Network to inspect idea-level relationships.',
          'Use Terminal for guided questions and evidence-grounded answers.',
        ],
      },
    ],
  },
  'terminal-guide': {
    title: 'Terminal Command Guide',
    subtitle: 'Agents Runtime command reference',
    icon: 'terminal',
    sections: [
      {
        heading: 'Answer Modes',
        bullets: [
          '`ask <question>`: narrative answer with citations.',
          '`brief <question>`: concise bullet output.',
          '`cv <question>`: experience-first framing.',
          '`projects <question>`: builds-first framing.',
        ],
      },
      {
        heading: 'Retrieval and Verification',
        bullets: [
          '`context <query>`: raw local retrieval snippets.',
          '`verify <query>`: web-grounded check against configured footprint links.',
          '`sources`: toggle/inspect citation footer behavior.',
        ],
      },
      {
        heading: 'Navigation Commands',
        bullets: [
          '`open network|projects|notes|resume|terminal`: jump directly to modules.',
          '`help`: list supported deterministic commands.',
          'Use deterministic commands first; use LLM modes when synthesis is needed.',
        ],
      },
    ],
  },
  'navigation-tips': {
    title: 'Navigation Tips',
    subtitle: 'Best way to explore DG-Labs OS',
    icon: 'navigation',
    sections: [
      {
        heading: 'Desktop Navigation',
        bullets: [
          'Use dock icons for quick app open/close.',
          'Use menubar actions for app-specific functions (filters, section jumps, presets).',
          'Use Window > Contact to open the links panel from anywhere on desktop.',
        ],
      },
      {
        heading: 'Reading Efficiency',
        bullets: [
          'Open multiple windows and compare Workbench, Network, and Notes side by side.',
          'Resize large modules so the toolbar and dock remain visible.',
          'Use Terminal to ask targeted questions instead of manual scrolling.',
        ],
      },
      {
        heading: 'Mobile Behavior',
        bullets: [
          'Mobile routes keep the iPhone shell metaphor and simplified controls.',
          'Desktop menubar behavior is intentionally reduced on mobile status bar mode.',
        ],
      },
    ],
  },
  'about-os': {
    title: 'About DG-Labs OS',
    subtitle: 'System definition: biological hardware, agentic software',
    icon: 'about',
    sections: [
      {
        heading: 'Hardware Spec (Metaphor)',
        bullets: [
          'Compute substrate: Human Cortex X (~86B-neuron architecture).',
          'Power profile: ~20W continuous, carbohydrate-fed energy loop.',
          'Learning bus: multimodal input (visual + verbal + social feedback).',
        ],
      },
      {
        heading: 'Runtime Model',
        bullets: [
          'Dual-process scheduler: fast heuristic path + slow deliberative path.',
          'Memory model: working memory for active tasks + long-term semantic compression.',
          'Update rule: iterate through build -> observe -> revise beliefs.',
        ],
      },
      {
        heading: 'System Objective',
        bullets: [
          'Optimize for human agency, not attention extraction.',
          'Convert research into production systems with explicit evidence trails.',
          'Expose ideas as explorable modules for both human and agent users.',
        ],
      },
    ],
  },
};

const topicIcon = {
  guide: IoHelpCircleOutline,
  terminal: IoTerminalOutline,
  navigation: IoCompassOutline,
  about: IoCodeSlash,
} as const;

export default function HelpGuideWindow({ isOpen, topic, onClose }: HelpGuideWindowProps) {
  if (!isOpen || !topic) return null;
  const content = TOPICS[topic];
  const HeaderIcon = topicIcon[content.icon];

  return (
    <DraggableWindow
      title={content.title}
      onClose={onClose}
      initialSize={{ width: 820, height: 620 }}
      centerOnMount={true}
      className="bg-[#1f1f24]"
    >
      <div className="h-full overflow-auto no-scrollbar px-6 py-5 text-white">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg border border-white/10 bg-white/5 p-2 text-white/80">
            <HeaderIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{content.title}</h2>
            <p className="mt-1 text-sm text-white/65">{content.subtitle}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {content.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-sm font-semibold tracking-wide text-white/85">
                {section.heading}
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-white/75">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>- {bullet}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </DraggableWindow>
  );
}
