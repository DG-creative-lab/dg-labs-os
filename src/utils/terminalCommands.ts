import type { NetworkNode } from '../config/network';
import type { WorkbenchItem } from '../config/workbench';
import type { LabNote } from '../config/labNotes';
import type { UserConfig } from '../types';

export type TerminalAction =
  | { type: 'navigate'; href: string }
  | { type: 'external'; href: string }
  | { type: 'mailto'; href: string }
  | { type: 'tel'; href: string }
  | { type: 'clear' }
  | { type: 'none' };

export type TerminalResponse = {
  lines: string[];
  action: TerminalAction;
};

export type TerminalContext = {
  user: UserConfig;
  workbench: readonly WorkbenchItem[];
  notes: readonly LabNote[];
  network: readonly NetworkNode[];
};

const APP_TARGETS: Record<string, string> = {
  projects: '/apps/projects',
  workbench: '/apps/projects',
  notes: '/apps/notes',
  resume: '/apps/resume',
  news: '/apps/news',
  network: '/apps/network',
  terminal: '/apps/terminal',
  desktop: '/desktop',
};

const HELP_TEXT = [
  'Available commands:',
  '  help                         Show this list',
  '  whoami                       DG-Labs summary',
  '  open <app>                   Open app: projects|notes|resume|news|network|desktop',
  '  projects                     List workbench projects',
  '  project <id>                 Show one project details',
  '  resume                       Show resume and open target',
  '  links                        Show key links',
  '  now                          Current focus',
  '  network                      Network graph summary',
  '  search <query>               Search projects, notes, and network',
  '  clear                        Clear terminal output',
];

const normalize = (value: string) => value.trim().toLowerCase();

const searchableText = (node: NetworkNode | WorkbenchItem | LabNote): string => {
  if ('summary' in node) {
    return `${node.title} ${node.subtitle} ${node.summary} ${node.stack.join(' ')}`.toLowerCase();
  }
  if ('readingTime' in node) {
    return `${node.title} ${node.subtitle} ${node.tags.join(' ')}`.toLowerCase();
  }
  return `${node.title} ${node.subtitle} ${node.tags.join(' ')} ${node.bullets.join(' ')}`.toLowerCase();
};

export const executeTerminalCommand = (
  rawInput: string,
  ctx: TerminalContext
): TerminalResponse => {
  const input = rawInput.trim();
  if (!input) {
    return { lines: [], action: { type: 'none' } };
  }

  const lower = normalize(input);
  const [command, ...rest] = lower.split(/\s+/);
  const args = rest.join(' ').trim();

  if (command === 'help') {
    return { lines: HELP_TEXT, action: { type: 'none' } };
  }

  if (command === 'clear') {
    return { lines: [], action: { type: 'clear' } };
  }

  if (command === 'whoami') {
    return {
      lines: [
        `${ctx.user.name} // cognitive interface`,
        `${ctx.user.role}`,
        `Focus: ${ctx.user.roleFocus}`,
        `Location: ${ctx.user.location}`,
      ],
      action: { type: 'none' },
    };
  }

  if (command === 'open') {
    const target = normalize(args);
    const href = APP_TARGETS[target];
    if (!href) {
      return {
        lines: [`Unknown target "${args}". Try: projects, notes, resume, news, network, desktop.`],
        action: { type: 'none' },
      };
    }
    return {
      lines: [`Opening ${target}...`],
      action: { type: 'navigate', href },
    };
  }

  if (command === 'projects') {
    const lines = ctx.workbench.map((item) => `- ${item.id}: ${item.title}`);
    return {
      lines: ['Workbench projects:', ...lines],
      action: { type: 'none' },
    };
  }

  if (command === 'project') {
    const id = normalize(args);
    const item = ctx.workbench.find((x) => normalize(x.id) === id);
    if (!item) {
      return {
        lines: [`Project "${args}" not found. Run "projects" to list valid ids.`],
        action: { type: 'none' },
      };
    }
    const link = item.links.site ?? item.links.repo ?? item.links.article;
    const lines = [
      `${item.title} (${item.id})`,
      item.subtitle,
      item.summary,
      `Stack: ${item.stack.slice(0, 6).join(', ')}`,
    ];
    if (link) {
      lines.push(`Primary link: ${link}`);
    }
    return { lines, action: { type: 'none' } };
  }

  if (command === 'resume') {
    return {
      lines: [
        'Timeline module ready.',
        `PDF: ${ctx.user.resume.url}`,
        'Use "open resume" to navigate.',
      ],
      action: { type: 'none' },
    };
  }

  if (command === 'links') {
    return {
      lines: [
        `GitHub: ${ctx.user.social.github}`,
        `LinkedIn: ${ctx.user.social.linkedin}`,
        `Email: mailto:${ctx.user.contact.email}`,
        `Call: tel:${ctx.user.contact.phone}`,
      ],
      action: { type: 'none' },
    };
  }

  if (command === 'now') {
    return {
      lines: [
        'Active focus:',
        '- Agentic commerce learning loops',
        '- Intent recognition and empowerment-first systems',
        '- Shipping DG-Labs OS as cognitive interface',
      ],
      action: { type: 'none' },
    };
  }

  if (command === 'network') {
    const total = ctx.network.length;
    const projectCount = ctx.network.filter((n) => n.kind === 'Project').length;
    const researchCount = ctx.network.filter((n) => n.kind === 'Research').length;
    const expCount = ctx.network.filter((n) => n.kind === 'Experience').length;

    return {
      lines: [
        `Network nodes: ${total}`,
        `Projects: ${projectCount}`,
        `Research: ${researchCount}`,
        `Experience: ${expCount}`,
        'Use "open network" to explore the graph.',
      ],
      action: { type: 'none' },
    };
  }

  if (command === 'search') {
    if (!args) {
      return { lines: ['Usage: search <query>'], action: { type: 'none' } };
    }
    const q = args.toLowerCase();
    const hits: string[] = [];

    for (const item of ctx.workbench) {
      if (searchableText(item).includes(q)) hits.push(`project: ${item.title}`);
    }
    for (const note of ctx.notes) {
      if (searchableText(note).includes(q)) hits.push(`note: ${note.title}`);
    }
    for (const node of ctx.network) {
      if (searchableText(node).includes(q)) hits.push(`node: ${node.title}`);
    }

    if (hits.length === 0) {
      return { lines: [`No results for "${args}".`], action: { type: 'none' } };
    }
    return {
      lines: [`Results for "${args}" (${hits.length}):`, ...hits.slice(0, 12)],
      action: { type: 'none' },
    };
  }

  return {
    lines: [`Unknown command: ${input}`, 'Run "help" to list commands.'],
    action: { type: 'none' },
  };
};
