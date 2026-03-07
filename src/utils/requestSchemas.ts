export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessageInput = {
  role: ChatRole;
  content: string;
};

export type ChatResponseMode = 'narrative' | 'agent_json';
export type ChatProvider = 'openrouter' | 'openai' | 'anthropic' | 'gemini';

export type ChatRequestInput = {
  messages: ChatMessageInput[];
  responseMode: ChatResponseMode;
  provider: ChatProvider;
  model: string;
  byokApiKey?: string;
  providerFallbackAllowed: boolean;
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
};

const asRecord = (input: unknown): Record<string, unknown> | null => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  return input as Record<string, unknown>;
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
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const parsed: ChatMessageInput[] = [];
  for (const item of messages) {
    const obj = asRecord(item);
    if (!obj) return null;
    const role = obj.role;
    const content = obj.content;
    if (
      (role !== 'system' && role !== 'user' && role !== 'assistant') ||
      typeof content !== 'string' ||
      content.trim().length === 0
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
    typeof byokApiKeyRaw === 'string' && byokApiKeyRaw.trim().length > 0
      ? byokApiKeyRaw.trim()
      : undefined;

  const providerFallbackAllowed = body.providerFallbackAllowed === true;

  return { messages, responseMode, provider, model, byokApiKey, providerFallbackAllowed };
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
  return { tool, input: parsedInput };
};
