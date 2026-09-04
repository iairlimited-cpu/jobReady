import type { ResumeData } from "@/features/resume/types";
import { Blocks } from "@/features/resume/templates/blocks";
import { contactParts } from "@/features/resume/templates/common";

/** Professional — classic serif, centred header, ruled section headings. */
export function ProfessionalTemplate({ data }: { data: ResumeData }) {
  const parts = contactParts(data.personal);
  const { fullName, professionalTitle } = data.personal;

  return (
    <div className="flex flex-col font-serif text-slate-900">
      <header className="mb-6 text-center">
        {fullName ? (
          <h1 className="text-[1.85rem] font-bold tracking-wide">{fullName}</h1>
        ) : null}
        {professionalTitle ? (
          <p className="mt-1 text-sm italic text-slate-600">{professionalTitle}</p>
        ) : null}
        {parts.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-700">
            {parts.map((part, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">|</span> : null}
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
            "border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-800",
        }}
      />
    </div>
  );
}
