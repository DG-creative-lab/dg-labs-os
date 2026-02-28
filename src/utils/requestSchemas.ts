export type ChatRole = 'system' | 'user' | 'assistant';

export type ChatMessageInput = {
  role: ChatRole;
  content: string;
};

export type AdminLoginInput = {
  username: string;
  password: string;
};

export type ContactInput = {
  name: string;
  email: string;
  message: string;
  company?: string;
  t?: number;
};

const asRecord = (input: unknown): Record<string, unknown> | null => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  return input as Record<string, unknown>;
};

export const parseAdminLoginInput = (input: unknown): AdminLoginInput | null => {
  const body = asRecord(input);
  if (!body) return null;
  const username = body.username;
  const password = body.password;
  if (typeof username !== 'string' || typeof password !== 'string') return null;
  return { username, password };
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
