import type { ResumeData } from "@/features/resume/types";
import { Blocks } from "@/features/resume/templates/blocks";
import { contactParts } from "@/features/resume/templates/common";

/** Academic — detail-first serif layout with a quieter header. */
export function AcademicTemplate({ data }: { data: ResumeData }) {
  const parts = contactParts(data.personal);
  const { fullName, professionalTitle } = data.personal;

  return (
    <div className="flex flex-col font-serif text-slate-900">
      <header className="mb-6">
        {fullName ? (
          <h1 className="text-[1.7rem] font-semibold tracking-tight">{fullName}</h1>
        ) : null}
        {professionalTitle ? (
          <p className="mt-1 text-sm italic text-slate-600">{professionalTitle}</p>
        ) : null}
        {parts.length > 0 ? (
          <div className="mt-2.5 flex flex-col gap-0.5 text-xs text-slate-700">
            {parts.map((part, index) => (
              <span key={index}>
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
          heading: "text-[0.95rem] font-semibold tracking-wide text-slate-900",
        }}
      />
    </div>
  );
}
