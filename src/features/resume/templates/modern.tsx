import type { ReactNode } from "react";

import type { ResumeData, SectionKey } from "@/features/resume/types";
import { Blocks } from "@/features/resume/templates/blocks";
import { contactParts } from "@/features/resume/templates/common";

const SIDEBAR: SectionKey[] = ["skills", "languages", "certifications"];

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** Modern — two columns with a calm accent sidebar. */
export function ModernTemplate({ data }: { data: ResumeData }) {
  const parts = contactParts(data.personal);
  const { fullName, professionalTitle } = data.personal;
  const skills = data.skills.map((skill) => skill.trim()).filter(Boolean);
  const hasSidebarContent =
    skills.length > 0 || data.languages.length > 0 || data.certifications.length > 0;

  return (
    <div className="grid grid-cols-[34%_1fr] gap-8 text-slate-900">
      {/* Sidebar */}
      {hasSidebarContent ? (
        <aside className="flex flex-col gap-5">
          {skills.length > 0 ? (
            <SidebarSection title="Skills">
              <ul className="flex flex-wrap gap-1.5">
                {skills.map((skill, index) => (
                  <li
                    key={index}
                    className="rounded-sm bg-indigo-50 px-2 py-0.5 text-[0.72rem] text-indigo-900"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </SidebarSection>
          ) : null}
          {data.languages.length > 0 ? (
            <SidebarSection title="Languages">
              <ul className="flex flex-col gap-1 text-[0.78rem]">
                {data.languages.map((language) => (
                  <li key={language.id}>
                    <span className="font-medium">{language.name}</span>
                    {language.level ? (
                      <span className="text-slate-500"> — {language.level}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </SidebarSection>
          ) : null}
          {data.certifications.length > 0 ? (
            <SidebarSection title="Certifications">
              <ul className="flex flex-col gap-1 text-[0.78rem]">
                {data.certifications.map((cert) => (
                  <li key={cert.id}>
                    <span className="font-medium">{cert.name}</span>
                    {cert.year ? (
                      <span className="text-slate-500"> · {cert.year}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </SidebarSection>
          ) : null}
        </aside>
      ) : (
        <div />
      )}

      {/* Main */}
      <div className="flex flex-col">
        <header className="mb-5 border-b-2 border-indigo-600/20 pb-4">
          {fullName ? (
            <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900">
              {fullName}
            </h1>
          ) : null}
          {professionalTitle ? (
            <p className="mt-1 text-sm font-medium text-indigo-700">
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
        <Blocks
          data={data}
          exclude={SIDEBAR}
          classes={{ heading: "text-xs font-bold uppercase tracking-[0.14em] text-indigo-700" }}
        />
      </div>
    </div>
  );
}
