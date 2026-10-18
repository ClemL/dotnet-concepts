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

/**
 * Highlighted HTML for one C# snippet. Light colors are inline and dark colors are in --shiki-dark
 * variables (switched in globals.css); the background comes from the --code-bg theme token.
 */
export async function highlightCsharp(code: string): Promise<string> {
  const h = await getHighlighter();
  return h.codeToHtml(code, {
    lang: "csharp",
    themes: { light: "github-light-default", dark: "github-dark-default" },
  });
}

/** Map of question id → highlighted HTML, for questions that have a code snippet. */
export async function highlightQuestions(questions: readonly Question[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const q of questions) {
    if (!q.code) continue;
    result[q.id] = await highlightCsharp(q.code);
  }
  return result;
}
