import { isValidElement, useRef, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children?: ReactNode;
}

function detectLanguage(children: ReactNode): string {
  if (isValidElement<{ className?: string }>(children)) {
    const match = /language-([\w-]+)/.exec(children.props.className ?? '');
    return match?.[1] ?? '';
  }
  return '';
}

/**
 * Fenced code block renderer: language header, copy button, highlighted body.
 * Used as the `pre` component inside MarkdownRenderer.
 */
export function CodeBlock({ children }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = detectLanguage(children);

  const copy = async () => {
    const text = preRef.current?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — ignore.
    }
  };

  return (
    <div className="group/code my-3 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex h-8 items-center justify-between border-b border-border bg-surface-raised px-3">
        <span className="font-mono text-[11px] text-faint">{language || 'code'}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted transition-colors hover:text-foreground cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3 text-success" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre ref={preRef} className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
