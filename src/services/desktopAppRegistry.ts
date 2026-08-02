export const DESKTOP_APP_IDS = [
  'terminal',
  'network',
  'projects',
  'notes',
  'evolution',
  'resume',
  'news',
] as const;

export type DesktopAppId = (typeof DESKTOP_APP_IDS)[number];
export type DesktopFocusedAppId = DesktopAppId | 'home';

export type DesktopAppWindowDefaults = {
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

export type DesktopAppDefinition = {
  id: DesktopAppId;
  label: string;
  route: string;
  aliases: readonly string[];
  window: DesktopAppWindowDefaults;
};

export const DESKTOP_APPS: Record<DesktopAppId, DesktopAppDefinition> = {
  terminal: {
    id: 'terminal',
    label: 'Profile Agent',
    route: '/apps/terminal',
    aliases: ['agents', 'profile-agent'],
    window: { title: 'Profile Agent', width: 1120, height: 720, x: 80, y: 64 },
  },
  network: {
    id: 'network',
    label: 'System Map',
    route: '/apps/network',
    aliases: ['map', 'connections'],
    window: { title: 'System Map', width: 1080, height: 700, x: 70, y: 70 },
  },
  projects: {
    id: 'projects',
    label: 'Workbench',
    route: '/apps/projects',
    aliases: ['workbench'],
    window: { title: 'Workbench', width: 980, height: 680, x: 80, y: 80 },
  },
  notes: {
    id: 'notes',
    label: 'Technical Writing',
    route: '/apps/notes',
    aliases: ['writing', 'analysis'],
    window: { title: 'Technical Writing', width: 920, height: 680, x: 110, y: 80 },
  },
  evolution: {
    id: 'evolution',
    label: 'Evidence & Evolution',
    route: '/apps/evolution',
    aliases: ['evidence'],
    window: { title: 'Evidence & Evolution', width: 980, height: 700, x: 105, y: 90 },
  },
  resume: {
    id: 'resume',
    label: 'Resume',
    route: '/apps/resume',
    aliases: [],
    window: { title: 'Resume', width: 920, height: 660, x: 130, y: 110 },
  },
  news: {
    id: 'news',
    label: 'Technical Writing',
    route: '/apps/news',
    aliases: [],
    window: { title: 'Technical Writing', width: 920, height: 680, x: 110, y: 80 },
  },
};

export const DESKTOP_APP_ROUTES: Record<DesktopAppId, string> = Object.fromEntries(
  DESKTOP_APP_IDS.map((id) => [id, DESKTOP_APPS[id].route])
) as Record<DesktopAppId, string>;

export const DESKTOP_APP_TARGETS: Record<string, string> = {
  desktop: '/desktop',
  ...Object.fromEntries(
    DESKTOP_APP_IDS.flatMap((id) => [
      [id, DESKTOP_APPS[id].route],
      ...DESKTOP_APPS[id].aliases.map((alias) => [alias, DESKTOP_APPS[id].route]),
    ])
  ),
};
