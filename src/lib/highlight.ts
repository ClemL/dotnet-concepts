import "server-only";
import { createHighlighter, type Highlighter } from "shiki";
import type { Question } from "@/data/questions";

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({
    themes: ["github-light-default", "github-dark-default"],
    langs: ["csharp"],
  });
  return highlighter;
}

/** Map of question id → highlighted HTML, for questions that have a code snippet. */
export async function highlightQuestions(questions: readonly Question[]): Promise<Record<string, string>> {
  const h = await getHighlighter();
  const result: Record<string, string> = {};
  for (const q of questions) {
    if (!q.code) continue;
    result[q.id] = h.codeToHtml(q.code, {
      lang: "csharp",
      themes: { light: "github-light-default", dark: "github-dark-default" },
      // Background comes from the theme tokens (--code-bg), so only token colors are used.
    });
  }
  return result;
}
