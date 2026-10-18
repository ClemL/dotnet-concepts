/** Shared Tailwind class strings in the editor style. */
export const buttonPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2 font-mono text-sm font-semibold text-accent-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

export const buttonSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 font-mono text-sm font-medium text-fg hover:border-border-strong hover:bg-surface-2";

export const textLink = "font-medium text-accent underline underline-offset-2 hover:no-underline";

/** Score color: green at 80%+, orange under 50%, neutral between. */
export function scoreTone(percent: number): string {
  return percent >= 80 ? "text-success" : percent < 50 ? "text-danger" : "text-fg";
}
