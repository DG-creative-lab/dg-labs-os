export type MachineMaturity = 'explicit-reducer' | 'boundary-enforced' | 'implicit';

export type StateMachineDefinition = {
  id: string;
  purpose: string;
  maturity: MachineMaturity;
  implementation: readonly string[];
  states: readonly string[];
  inputs: readonly string[];
  outputs: readonly string[];
  invariants: readonly string[];
  nonDeterministicEffects: readonly string[];
};

export const stateMachineCatalog = [
  {
    id: 'desktop-shell',
    purpose: 'Keep window visibility and focus deterministic across desktop events.',
    maturity: 'explicit-reducer',
    implementation: ['src/services/desktopShellReducer.ts', 'src/services/desktopWindowService.ts'],
    states: ['ready'],
    inputs: ['OPEN_WINDOW', 'TOGGLE_WINDOW', 'FOCUS_APP', 'CLOSE_WINDOW'],
    outputs: ['DesktopOpenState', 'DesktopFocusedAppId'],
    invariants: [
      'The focused target is home or a registered application.',
      'Logical application focus may exist independently of window visibility.',
      'Closing the focused application returns focus to home.',
      'The same state and input produce the same next state.',
    ],
    nonDeterministicEffects: [],
  },
  {
    id: 'profile-activation',
    purpose: 'Activate only valid, owner-approved public profile projections.',
    maturity: 'boundary-enforced',
    implementation: ['src/profiles/runtime.ts', 'src/profiles/validation.ts'],
    states: ['draft', 'published', 'withdrawn', 'rejected'],
    inputs: ['VALIDATE', 'ACTIVATE', 'RESOLVE'],
    outputs: ['ActiveProfileRuntime', 'typed rejection'],
    invariants: [
      'Only a published projection can become active.',
      'Unknown handles never fall back to another profile.',
      'An active runtime contains no private source metadata.',
    ],
    nonDeterministicEffects: [],
  },
  {
    id: 'profile-module-registration',
    purpose: 'Bind reviewed public modules to exactly one matching published profile.',
    maturity: 'boundary-enforced',
    implementation: [
      'src/profiles/modules/runtime.ts',
      'src/profiles/modules/validation.ts',
      'src/profiles/writing/runtime.ts',
      'src/profiles/writing/validation.ts',
    ],
    states: ['unregistered', 'registered', 'rejected'],
    inputs: ['VALIDATE', 'REGISTER', 'RESOLVE'],
    outputs: ['PublicProfileModules', 'PublicWritingModule', 'typed rejection'],
    invariants: [
      'Profile ID, handle, and projection version match the owning profile.',
      'Invalid or unpublished modules cannot be registered.',
      'Resolving one profile never returns another profile module bundle.',
    ],
    nonDeterministicEffects: [],
  },
  {
    id: 'profile-agent-request',
    purpose: 'Keep request validation, evidence scope, provider execution, and streaming ordered.',
    maturity: 'implicit',
    implementation: [
      'src/pages/api/chat.ts',
      'src/pages/api/chat/stream.ts',
      'src/services/chatService.ts',
    ],
    states: ['received', 'validated', 'scoped', 'executing', 'completed', 'failed'],
    inputs: ['REQUEST', 'PROFILE_RESOLVED', 'PROVIDER_EVENT', 'TIMEOUT', 'FAILURE'],
    outputs: ['ChatSuccessEnvelope', 'SSE event sequence', 'typed error'],
    invariants: [
      'A request is validated before provider execution.',
      'Evidence is resolved from the requested profile before retrieval.',
      'A terminal SSE sequence emits at most one terminal result or error before done.',
      'Provider text never changes evidence authority or tool permissions.',
    ],
    nonDeterministicEffects: ['Model-generated text', 'Provider latency', 'Provider availability'],
  },
] as const satisfies readonly StateMachineDefinition[];
