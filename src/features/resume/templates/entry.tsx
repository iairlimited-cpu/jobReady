import type { ResumeData } from "@/features/resume/types";
import { Blocks } from "@/features/resume/templates/blocks";
import { contactParts } from "@/features/resume/templates/common";

/** Entry-level — friendly, clear and encouraging for first applications. */
export function EntryTemplate({ data }: { data: ResumeData }) {
  const parts = contactParts(data.personal);
  const { fullName, professionalTitle } = data.personal;

  return (
    <div className="flex flex-col text-slate-900">
      <header className="mb-6 rounded-lg bg-indigo-50 px-6 py-5">
        {fullName ? (
          <h1 className="text-[1.75rem] font-bold tracking-tight text-indigo-950">
            {fullName}
          </h1>
        ) : null}
        {professionalTitle ? (
          <p className="mt-1 text-sm font-semibold text-indigo-700">
            {professionalTitle}
          </p>
        ) : null}
        {parts.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-indigo-900/80">
            {parts.map((part, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">•</span> : null}
                {part.href ? (
                  <a href={part.href} className="underline-offset-2 hover:underline">
                    {part.value}
                  </a>
                ) : (
                  part.value
                )}
              </span>
            ))}
          </div>
        ) : null}
      </header>
      <Blocks
        data={data}
        classes={{
          heading:
            "rounded px-2 py-0.5 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700",
        }}
      />
    </div>
  );
}
