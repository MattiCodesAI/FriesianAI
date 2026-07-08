export const CHAT_INPUT_ID = 'friesian-chat-input';

/** Focus the chat input from anywhere (keyboard shortcuts, empty states). */
export function focusChatInput(): void {
  const el = document.getElementById(CHAT_INPUT_ID);
  if (el instanceof HTMLTextAreaElement) {
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }
}

/**
 * Programmatically set the (controlled) chat input's value from outside React
 * — used by suggestion chips and pinned prompts. Dispatching a native input
 * event routes the change through React's onChange handler.
 */
export function setChatInputValue(text: string): void {
  const el = document.getElementById(CHAT_INPUT_ID);
  if (el instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  focusChatInput();
}
