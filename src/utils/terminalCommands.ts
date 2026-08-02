import type { ActiveProfileRuntime } from '../profiles';
import type { TerminalBrainMode } from './terminalSettings';

export type TerminalAction =
  | { type: 'navigate'; href: string }
  | { type: 'external'; href: string }
  | { type: 'mailto'; href: string }
  | { type: 'tel'; href: string }
  | { type: 'set_mode'; mode: TerminalBrainMode }
  | { type: 'verify'; query: string }
  | { type: 'list_tools' }
  | {
      type: 'tool_call';
      tool:
        | 'profile_context'
        | 'local_context'
        | 'web_verify'
        | 'open_app'
        | 'list_projects'
        | 'retrieve'
        | 'cite';
      input?: Record<string, unknown>;
    }
  | { type: 'clear' }
  | { type: 'none' };

export type TerminalResponse = {
  lines: string[];
  action: TerminalAction;
};

export type TerminalContext = {
  profile: ActiveProfileRuntime;
};

const APP_TARGETS: Record<string, string> = {
  projects: '/apps/projects',
  workbench: '/apps/projects',
  writing: '/apps/notes',
  analysis: '/apps/notes',
  notes: '/apps/notes',
  resume: '/apps/resume',
  news: '/apps/notes',
  network: '/apps/network',
  map: '/apps/network',
  connections: '/apps/network',
  terminal: '/apps/terminal',
  desktop: '/desktop',
};

const DETERMINISTIC_COMMANDS = new Set([
  'help',
  'clear',
  'whoami',
  'open',
  'projects',
  'project',
  'resume',
  'links',
  'now',
  'network',
  'search',
  'sources',
  'context',
  'mode',
  'verify',
  'tools',
  'tool',
]);

export const isDeterministicTerminalCommand = (rawInput: string): boolean => {
  const input = rawInput.trim().toLowerCase();
  if (!input) return false;
  const [command] = input.split(/\s+/, 1);
  return DETERMINISTIC_COMMANDS.has(command);
};

const HELP_TEXT = [
  'Talk naturally by default. Use commands when you want something exact.',
  'Available commands:',
  '  help                         Show this list',
  '  whoami                       Public profile summary',
  '  open <app>                   Open app: projects|writing|resume|network|desktop',
  '  projects                     List workbench projects',
  '  project <id>                 Show one project details',
  '  resume                       Show resume and open target',
  '  links                        Show key links',
  '  now                          Current focus',
  '  network                      System Map summary',
  '  search <query>               Search projects, writing, and the System Map',
  '  sources                      Show indexed context sources',
  '  context <query>              Retrieve top local context snippets',
  '  mode <concise|explainer|research>  Set LLM answer style',
  '  brief <question>             Short bullet answer',
  '  cv <question>                Experience-first answer',
  '  projects <question>          Builds-first answer',
  '  verify <query>               Verify with web sources and citations',
  '  tools                        List available tools and status',
  '  tool <name> <input>          Run a tool (local_context|web_verify|open_app|list_projects|retrieve|cite)',
  '  clear                        Clear terminal output',
];

const normalize = (value: string) => value.trim().toLowerCase();

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
        `${ctx.profile.identity.displayName} // cognitive interface`,
        `${ctx.profile.identity.role}`,
        `Focus: ${ctx.profile.identity.roleFocus}`,
        `Location: ${ctx.profile.identity.location}`,
      ],
      action: { type: 'none' },
    };
  }

  if (command === 'open') {
    const target = normalize(args);
    const href = APP_TARGETS[target];
    if (!href) {
      return {
        lines: [`Unknown target "${args}". Try: projects, writing, resume, network, desktop.`],
        action: { type: 'none' },
      };
    }
    return {
      lines: [`Opening ${target}...`],
      action: { type: 'navigate', href },
    };
  }

  if (command === 'projects') {
    return {
      lines: [],
      action: { type: 'tool_call', tool: 'profile_context', input: { command: 'projects' } },
    };
  }

  if (command === 'project') {
    if (!args) {
      return {
        lines: ['Usage: project <id>'],
        action: { type: 'none' },
      };
    }
    return {
      lines: [],
      action: {
        type: 'tool_call',
        tool: 'profile_context',
        input: { command: 'project', args },
      },
    };
  }

  if (command === 'resume') {
    const files = ctx.profile.cv.primary.files;
    return {
      lines: [
        'Timeline module ready.',
        `PDF: ${files.pdf}`,
        `DOCX: ${files.docx}`,
        `Markdown: ${files.markdown}`,
        'Use "open resume" to navigate.',
      ],
      action: { type: 'none' },
    };
  }

  if (command === 'links') {
    const lines = ctx.profile.links
      .filter((link) => link.trust === 'high')
      .map((link) => `${link.label}: ${link.url}`);
    return {
      lines,
      action: { type: 'none' },
    };
  }

  if (command === 'now') {
    return {
      lines: [],
      action: { type: 'tool_call', tool: 'profile_context', input: { command: 'now' } },
    };
  }

  if (command === 'network') {
    return {
      lines: [],
      action: { type: 'tool_call', tool: 'profile_context', input: { command: 'network' } },
    };
  }

  if (command === 'search') {
    if (!args) {
      return { lines: ['Usage: search <query>'], action: { type: 'none' } };
    }
    return {
      lines: [],
      action: {
        type: 'tool_call',
        tool: 'profile_context',
        input: { command: 'search', args },
      },
    };
  }

  if (command === 'sources') {
    return {
      lines: [],
      action: { type: 'tool_call', tool: 'profile_context', input: { command: 'sources' } },
    };
  }

  if (command === 'context') {
    if (!args) {
      return { lines: ['Usage: context <query>'], action: { type: 'none' } };
    }
    return {
      lines: [],
      action: {
        type: 'tool_call',
        tool: 'profile_context',
        input: { command: 'context', args },
      },
    };
  }

  if (command === 'mode') {
    if (!args) {
      return {
        lines: ['Usage: mode <concise|explainer|research>'],
        action: { type: 'none' },
      };
    }
    if (args !== 'concise' && args !== 'explainer' && args !== 'research') {
      return {
        lines: [`Unknown mode "${args}". Use: concise, explainer, research.`],
        action: { type: 'none' },
      };
    }
    return {
      lines: [`Brain mode set to ${args}.`],
      action: { type: 'set_mode', mode: args },
    };
  }

  if (command === 'verify') {
    if (!args) {
      return { lines: ['Usage: verify <query>'], action: { type: 'none' } };
    }
    return {
      lines: [`Verifying "${args}" against web sources...`],
      action: { type: 'verify', query: args },
    };
  }

  if (command === 'tools') {
    return {
      lines: ['Tools registry: local_context, web_verify, open_app, list_projects, retrieve, cite'],
      action: { type: 'list_tools' },
    };
  }

  if (command === 'tool') {
    if (!args) {
      return {
        lines: [
          'Usage: tool <local_context|web_verify|open_app|list_projects|retrieve|cite> <input>',
        ],
        action: { type: 'none' },
      };
    }

    const [toolName, ...toolRest] = args.split(/\s+/);
    const toolInput = toolRest.join(' ').trim();

    if (toolName === 'list_projects') {
      return {
        lines: ['Running tool: list_projects'],
        action: { type: 'tool_call', tool: 'list_projects' },
      };
    }

    if (toolName === 'local_context') {
      if (!toolInput) {
        return { lines: ['Usage: tool local_context <query>'], action: { type: 'none' } };
      }
      return {
        lines: [`Running tool: local_context ("${toolInput}")`],
        action: { type: 'tool_call', tool: 'local_context', input: { query: toolInput } },
      };
    }

    if (toolName === 'web_verify') {
      if (!toolInput) {
        return { lines: ['Usage: tool web_verify <query>'], action: { type: 'none' } };
      }
      return {
        lines: [`Running tool: web_verify ("${toolInput}")`],
        action: { type: 'tool_call', tool: 'web_verify', input: { query: toolInput } },
      };
    }

    if (toolName === 'open_app') {
      if (!toolInput) {
        return { lines: ['Usage: tool open_app <target>'], action: { type: 'none' } };
      }
      return {
        lines: [`Running tool: open_app ("${toolInput}")`],
        action: { type: 'tool_call', tool: 'open_app', input: { target: toolInput } },
      };
    }

    if (toolName === 'retrieve') {
      if (!toolInput) {
        return { lines: ['Usage: tool retrieve <query>'], action: { type: 'none' } };
      }
      return {
        lines: [`Running tool: retrieve ("${toolInput}")`],
        action: { type: 'tool_call', tool: 'retrieve', input: { query: toolInput } },
      };
    }

    if (toolName === 'cite') {
      if (!toolInput) {
        return { lines: ['Usage: tool cite <claim>'], action: { type: 'none' } };
      }
      return {
        lines: [`Running tool: cite ("${toolInput}")`],
        action: { type: 'tool_call', tool: 'cite', input: { claim: toolInput } },
      };
    }

    return {
      lines: [
        `Unknown tool "${toolName}". Use: local_context, web_verify, open_app, list_projects, retrieve, cite.`,
      ],
      action: { type: 'none' },
    };
  }

  return {
    lines: [`Unknown command: ${input}`, 'Run "help" to list commands.'],
    action: { type: 'none' },
  };
};
