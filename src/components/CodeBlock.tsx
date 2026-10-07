/** Server-highlighted shiki HTML. The HTML is generated at build time from our own question data. */
export function CodeBlock({ html, label = "C# code" }: { html: string; label?: string }) {
  return (
    <figure className="code-block my-4 min-w-0" aria-label={label}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
