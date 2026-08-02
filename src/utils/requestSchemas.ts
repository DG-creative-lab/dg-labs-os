export type ChatRole = 'user' | 'assistant';

export type ChatMessageInput = {
  role: ChatRole;
  content: string;
};

export type ChatResponseMode = 'narrative' | 'agent_json';
export type ChatProvider = 'openrouter' | 'openai' | 'anthropic' | 'gemini';
export type ChatAnswerMode = 'ask' | 'brief' | 'cv' | 'projects';
export type ChatBrainMode = 'concise' | 'explainer' | 'research';

export type ChatRequestInput = {
  messages: ChatMessageInput[];
  responseMode: ChatResponseMode;
  provider: ChatProvider;
  model: string;
  byokApiKey?: string;
  providerFallbackAllowed: boolean;
  profileHandle: string;
  answerMode: ChatAnswerMode;
  brainMode: ChatBrainMode;
};

export type ContactInput = {
  name: string;
  email: string;
  message: string;
  company?: string;
  t?: number;
};

export type VerifyInput = {
  query: string;
};

export type ToolName =
  | 'local_context'
  | 'web_verify'
  | 'open_app'
  | 'list_projects'
  | 'retrieve'
  | 'cite';

export type ToolCallInput = {
  tool: ToolName;
  input?: Record<string, unknown>;
  profileHandle: string;
};

const asRecord = (input: unknown): Record<string, unknown> | null => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  return input as Record<string, unknown>;
};

const PROFILE_HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const parseRequiredProfileHandle = (input: unknown): string | null => {
  const body = asRecord(input);
  if (!body || typeof body.profileHandle !== 'string') return null;
  const handle = body.profileHandle.trim();
  return PROFILE_HANDLE_PATTERN.test(handle) ? handle : null;
};

export const parseContactInput = (input: unknown): ContactInput | null => {
  const body = asRecord(input);
  if (!body) return null;

  const { name, email, message, company, t } = body;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return null;
  }

  const parsed: ContactInput = {
    name,
    email,
    message,
  };

  if (typeof company === 'string') parsed.company = company;
  if (typeof t === 'number' && Number.isFinite(t)) parsed.t = t;

  return parsed;
};

export const parseChatMessagesInput = (input: unknown): ChatMessageInput[] | null => {
  const body = asRecord(input);
  if (!body) return null;
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 13) return null;

  const parsed: ChatMessageInput[] = [];
  for (const item of messages) {
    const obj = asRecord(item);
    if (!obj) return null;
    const role = obj.role;
    const content = obj.content;
    if (
      (role !== 'user' && role !== 'assistant') ||
      typeof content !== 'string' ||
      content.trim().length === 0 ||
      content.length > 4000
    ) {
      return null;
    }
    parsed.push({ role, content });
  }
  return parsed;
};

export const parseChatRequestInput = (input: unknown): ChatRequestInput | null => {
  const body = asRecord(input);
  if (!body) return null;
  const messages = parseChatMessagesInput(body);
  if (!messages) return null;

  const responseModeRaw = body.responseMode;
  const responseMode: ChatResponseMode =
    responseModeRaw === 'agent_json' || responseModeRaw === 'narrative'
      ? responseModeRaw
      : 'narrative';

  const providerRaw = body.provider;
  const provider: ChatProvider =
    providerRaw === 'openrouter' ||
    providerRaw === 'openai' ||
    providerRaw === 'anthropic' ||
    providerRaw === 'gemini'
      ? providerRaw
      : 'openrouter';

  const modelRaw = body.model;
  const model =
    typeof modelRaw === 'string' && modelRaw.trim().length > 0
      ? modelRaw.trim().slice(0, 200)
      : provider === 'openrouter'
        ? 'openai/gpt-oss-120b'
        : '';

  const byokApiKeyRaw = body.byokApiKey;
  const byokApiKey =
    typeof byokApiKeyRaw === 'string' &&
    byokApiKeyRaw.trim().length > 0 &&
    byokApiKeyRaw.trim().length <= 2048
      ? byokApiKeyRaw.trim()
      : undefined;

  const providerFallbackAllowed = body.providerFallbackAllowed === true;

  const profileHandle = parseRequiredProfileHandle(body);
  if (!profileHandle) return null;

  const answerModeRaw = body.answerMode;
  const answerMode: ChatAnswerMode =
    answerModeRaw === 'brief' || answerModeRaw === 'cv' || answerModeRaw === 'projects'
      ? answerModeRaw
      : 'ask';

  const brainModeRaw = body.brainMode;
  const brainMode: ChatBrainMode =
    brainModeRaw === 'concise' || brainModeRaw === 'research' ? brainModeRaw : 'explainer';

  return {
    messages,
    responseMode,
    provider,
    model,
    byokApiKey,
    providerFallbackAllowed,
    profileHandle,
    answerMode,
    brainMode,
  };
};

export const parseVerifyInput = (input: unknown): VerifyInput | null => {
  const body = asRecord(input);
  if (!body) return null;
  const query = body.query;
  if (typeof query !== 'string') return null;
  const trimmed = query.trim();
  if (trimmed.length < 2) return null;
  return { query: trimmed };
};

export const parseToolCallInput = (input: unknown): ToolCallInput | null => {
  const body = asRecord(input);
  if (!body) return null;
  const tool = body.tool;
  if (
    tool !== 'local_context' &&
    tool !== 'web_verify' &&
    tool !== 'open_app' &&
    tool !== 'list_projects' &&
    tool !== 'retrieve' &&
    tool !== 'cite'
  ) {
    return null;
  }
  const maybeInput = body.input;
  const parsedInput =
    maybeInput && typeof maybeInput === 'object' && !Array.isArray(maybeInput)
      ? (maybeInput as Record<string, unknown>)
      : undefined;
  const profileHandle = parseRequiredProfileHandle(body);
  if (!profileHandle) return null;
  return { tool, input: parsedInput, profileHandle };
};
