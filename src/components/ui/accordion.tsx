import type { ReactNode } from "react";

/**
 * Accessible FAQ item built on native <details>/<summary> —
 * no client JavaScript, keyboard and screen-reader friendly by default.
 */
export function AccordionItem({
  question,
  children,
}: {
  question: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-lg border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
        {question}
        <svg
          className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </details>
  );
}
