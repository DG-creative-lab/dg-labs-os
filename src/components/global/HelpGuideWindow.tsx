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
          'Workbench: production systems, enterprise platforms, and engineering artifacts.',
          'Network: graph of education, experience, research, and shipped systems with idea-level connections.',
          'Agents Terminal: command surface for deterministic actions, provider-aware reasoning, and evidence-grounded answers.',
          'Resume: canonical profile module with local downloadable formats.',
          'Lab Notes: research threads, implementation principles, and system-design heuristics.',
        ],
      },
      {
        heading: 'How It Operates',
        bullets: [
          'Facts are stored as structured modules; ideas are modeled as links between systems, roles, and writings.',
          'The dock is for fast module switching; the menu bar changes with the focused window.',
          'Windows can be moved and resized to support side-by-side comparison across systems, notes, and graph views.',
        ],
      },
      {
        heading: 'Recommended Flow',
        bullets: [
          'Start in Workbench for the strongest engineering and platform overview.',
          'Open Network to inspect how projects, experience, and research reinforce each other.',
          'Use Resume when you need the canonical career narrative and downloadable artifacts.',
          'Use Terminal for guided questions, verification, and cross-surface synthesis.',
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
          '`context <query>`: raw local retrieval snippets from the indexed portfolio knowledge base.',
          '`verify <query>`: web-grounded check against configured footprint links and public sources.',
          '`sources`: toggle/inspect citation footer behavior.',
        ],
      },
      {
        heading: 'Navigation Commands',
        bullets: [
          '`open network|projects|notes|resume|terminal`: jump directly to modules.',
          '`help`: list supported deterministic commands.',
          'Use deterministic commands first; use LLM modes when synthesis, comparison, or explanation is needed.',
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
          'Use menubar actions for app-specific functions such as filters, section jumps, presets, and downloads.',
          'Use Window > Contact to open the links panel from anywhere on desktop.',
        ],
      },
      {
        heading: 'Reading Efficiency',
        bullets: [
          'Open multiple windows and compare Workbench, Network, Resume, and Notes side by side.',
          'Resize large modules so the menubar and dock remain visible during comparison.',
          'Use Terminal to ask targeted questions instead of manually scanning long modules.',
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
          'Learning bus: multimodal input (visual, verbal, and social feedback).',
        ],
      },
      {
        heading: 'Runtime Model',
        bullets: [
          'Dual-process scheduler: fast heuristic path + slow deliberative path.',
          'Memory model: working memory for active tasks + long-term semantic compression.',
          'Update rule: build -> observe -> revise beliefs -> encode reusable system patterns.',
        ],
      },
      {
        heading: 'Engineering Profile',
        bullets: [
          'Primary outputs are production systems, enterprise platform controls, infrastructure governance, and retrieval-grounded interfaces.',
          'Research is used as system design input, not as a substitute for implementation.',
          'The portfolio is structured so both humans and AI agents can inspect artifacts, evidence, and cross-links.',
        ],
      },
      {
        heading: 'System Objective',
        bullets: [
          'Optimize for human agency, not attention extraction.',
          'Convert research into production systems with explicit evidence trails and operational contracts.',
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
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{content.title}</h2>
            <p className="mt-1 text-sm text-white/65">{content.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
          >
            Close Guide
          </button>
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
