import type { ResumeData } from "@/features/resume/types";
import { Blocks } from "@/features/resume/templates/blocks";
import { contactParts } from "@/features/resume/templates/common";

/** Minimal — clean single column, restrained. */
export function MinimalTemplate({ data }: { data: ResumeData }) {
  const parts = contactParts(data.personal);
  const { fullName, professionalTitle } = data.personal;

  return (
    <div className="flex flex-col text-slate-900">
      <header className="mb-6 border-b border-slate-200 pb-4">
        {fullName ? (
          <h1 className="text-[1.75rem] font-bold tracking-tight">{fullName}</h1>
        ) : null}
        {professionalTitle ? (
          <p className="mt-1 text-sm font-medium text-slate-600">
            {professionalTitle}
          </p>
        ) : null}
        {parts.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-600">
            {parts.map((part, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">·</span> : null}
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
      <Blocks data={data} />
    </div>
  );
}
