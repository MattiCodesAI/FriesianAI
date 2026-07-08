/** Three-dot pulse shown while the assistant is thinking. */
export function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 py-1.5" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: '900ms' }}
        />
      ))}
    </span>
  );
}
