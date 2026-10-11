"use client";

import { useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";

export interface TabSpec {
  /** URL fragment for the tab, e.g. "eli5" → /concepts/linq#eli5. */
  id: string;
  label: string;
  /** Rendered on the server and passed in; every panel stays in the HTML, inactive ones are hidden. */
  panel: ReactNode;
}

// The selected tab lives in the URL fragment, so tabs can be linked to and survive a reload.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

const getHash = () => window.location.hash.slice(1);
const getServerHash = () => "";

/** Updates the fragment without scrolling or adding a history entry, then re-renders subscribers. */
function selectHash(id: string) {
  window.history.replaceState(window.history.state, "", `#${id}`);
  listeners.forEach((notify) => notify());
}

/** WAI-ARIA tabs: arrow keys move between tabs, Home/End jump to the ends, selection follows focus. */
export function ConceptTabs({ tabs, label }: { tabs: TabSpec[]; label: string }) {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);
  const active = tabs.find((t) => t.id === hash) ?? tabs[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function select(index: number, focus: boolean) {
    selectHash(tabs[index].id);
    if (focus) tabRefs.current[index]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const target =
      e.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : e.key === "ArrowLeft"
          ? (index + last) % tabs.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (target === null) return;
    e.preventDefault();
    select(target, true);
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex flex-wrap gap-2">
        {tabs.map((t, i) => {
          const selected = t.id === active.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i, false)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold ${
                selected ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-fg hover:bg-surface-2"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          tabIndex={0}
          hidden={t.id !== active.id}
          className="mt-4 min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-6"
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
