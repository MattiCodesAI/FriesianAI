import type { StreamChatParams, StreamChunk } from './types';
import { getModel } from '@/constants/models';

/**
 * Local streaming simulator used by every provider in the MVP.
 *
 * It produces a plausible, markdown-rich response and streams it token by
 * token so the entire UI pipeline (streaming state, auto-scroll, stop
 * generation, markdown rendering) is exercised exactly as it will be with
 * real providers. Replacing it with a real API call only requires changing
 * the provider's `streamChat` implementation.
 */

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });

function buildResponse(params: StreamChatParams, providerLabel: string): string {
  const lastUser = [...params.messages].reverse().find((m) => m.role === 'user');
  const prompt = lastUser?.content ?? '';
  const modelLabel = getModel(params.modelId)?.label ?? params.modelId;
  const wantsCode = /\b(code|function|component|typescript|react|python|bug|error|implement)\b/i.test(
    prompt,
  );

  const intro = `Here's my take on that.`;

  const codeSection = [
    'A minimal example:',
    '',
    '```ts',
    'export function greet(name: string): string {',
    '  return `Hello, ${name}!`;',
    '}',
    '',
    'console.log(greet("Matti"));',
    '```',
    '',
    'Key points:',
    '',
    '- Keep functions small and typed end-to-end.',
    '- Handle the empty-input case explicitly.',
    '- Add a unit test before extending behavior.',
  ].join('\n');

  const proseSection = [
    'Breaking it down:',
    '',
    '1. **Start with the goal** — be explicit about what a good outcome looks like.',
    '2. **Work in small steps** — validate each one before moving on.',
    '3. **Capture what you learn** — drop useful results into this project’s notes so they stay searchable.',
    '',
    'Want me to go deeper on any of these?',
  ].join('\n');

  const footer = `\n\n---\n*Simulated response from **${modelLabel}** via ${providerLabel}. Add an API key in Settings → API to route this through the real provider.*`;

  return `${intro}\n\n${wantsCode ? codeSection : proseSection}${footer}`;
}

/** Split into small chunks that stream like real model tokens. */
function tokenize(text: string): string[] {
  return text.match(/\s*\S+/g) ?? [];
}

export async function* simulateStream(
  params: StreamChatParams,
  providerLabel: string,
): AsyncGenerator<StreamChunk, void, void> {
  const response = buildResponse(params, providerLabel);
  const tokens = tokenize(response);

  try {
    // Initial "thinking" latency.
    await sleep(350 + Math.random() * 400, params.signal);

    for (const token of tokens) {
      if (params.signal?.aborted) return;
      yield { type: 'delta', text: token };
      await sleep(8 + Math.random() * 26, params.signal);
    }
    yield { type: 'done' };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    yield { type: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}
