import { describe, expect, it, vi } from 'vitest';
import { copyTextWithFallback, type ClipboardAdapter } from '../src/services/clipboardService';

const createAdapter = ({
  clipboardWorks,
  execCommandResult,
}: {
  clipboardWorks: boolean;
  execCommandResult: boolean;
}): {
  adapter: ClipboardAdapter;
  execCommand: ReturnType<typeof vi.fn>;
  appendChild: ReturnType<typeof vi.fn>;
  removeChild: ReturnType<typeof vi.fn>;
  writeText: ReturnType<typeof vi.fn>;
  textarea: HTMLTextAreaElement;
} => {
  const textarea = {
    value: '',
    style: { position: '', left: '' },
    setAttribute: vi.fn(),
    select: vi.fn(),
  } as unknown as HTMLTextAreaElement;

  const writeText = clipboardWorks
    ? vi.fn().mockResolvedValue(undefined)
    : vi.fn().mockRejectedValue(new Error('clipboard unavailable'));
  const execCommand = vi.fn().mockReturnValue(execCommandResult);
  const appendChild = vi.fn();
  const removeChild = vi.fn();

  return {
    adapter: {
      navigator: {
        clipboard: {
          writeText,
        },
      },
      document: {
        createElement: vi.fn().mockReturnValue(textarea),
        body: {
          appendChild,
          removeChild,
        },
        execCommand,
      },
    },
    execCommand,
    appendChild,
    removeChild,
    writeText,
    textarea,
  };
};

describe('clipboardService', () => {
  it('copies using navigator.clipboard when available', async () => {
    const ctx = createAdapter({ clipboardWorks: true, execCommandResult: false });
    const copied = await copyTextWithFallback('hello world', ctx.adapter);
    expect(copied).toBe(true);
    expect(ctx.writeText).toHaveBeenCalledWith('hello world');
    expect(ctx.execCommand).not.toHaveBeenCalled();
  });

  it('falls back to execCommand when clipboard API fails', async () => {
    const ctx = createAdapter({ clipboardWorks: false, execCommandResult: true });
    const copied = await copyTextWithFallback('fallback copy', ctx.adapter);
    expect(copied).toBe(true);
    expect(ctx.writeText).toHaveBeenCalledWith('fallback copy');
    expect(ctx.appendChild).toHaveBeenCalledWith(ctx.textarea);
    expect(ctx.execCommand).toHaveBeenCalledWith('copy');
    expect(ctx.removeChild).toHaveBeenCalledWith(ctx.textarea);
  });

  it('returns false when both clipboard and execCommand fail', async () => {
    const ctx = createAdapter({ clipboardWorks: false, execCommandResult: false });
    const copied = await copyTextWithFallback('no copy', ctx.adapter);
    expect(copied).toBe(false);
  });
});
