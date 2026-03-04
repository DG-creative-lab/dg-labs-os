export type ClipboardAdapter = {
  navigator: {
    clipboard?: {
      writeText: (text: string) => Promise<void>;
    };
  };
  document: {
    createElement: (tagName: string) => HTMLTextAreaElement;
    body: {
      appendChild: (node: HTMLTextAreaElement) => void;
      removeChild: (node: HTMLTextAreaElement) => void;
    };
    execCommand: (commandId: string) => boolean;
  };
};

const defaultClipboardAdapter = (): ClipboardAdapter => ({
  navigator: window.navigator,
  document: window.document,
});

export const copyTextWithFallback = async (
  text: string,
  adapter: ClipboardAdapter = defaultClipboardAdapter()
): Promise<boolean> => {
  const writeText = adapter.navigator.clipboard?.writeText;
  if (writeText) {
    try {
      await writeText(text);
      return true;
    } catch {
      // Fall through to legacy fallback.
    }
  }

  const textarea = adapter.document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  adapter.document.body.appendChild(textarea);
  textarea.select();
  const copied = adapter.document.execCommand('copy');
  adapter.document.body.removeChild(textarea);
  return copied;
};
