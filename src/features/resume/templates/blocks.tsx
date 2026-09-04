import { Bullets, formatPeriod } from "@/features/resume/templates/common";
import { documentSections } from "@/features/resume/templates/common";
import type { ResumeData, SectionKey } from "@/features/resume/types";

/**
 * Shared, content-accurate section renderers. Templates stay independent by
 * owning layout/typography while reusing these blocks for content fidelity.
 */

export interface BlockClasses {
  /** Section heading classes (h2). */
  heading: string;
  /** Item title / strong text. */
  title?: string;
  /** Dates / issuers / secondary text. */
  meta?: string;
  /** Body text. */
  body?: string;
}

export const DEFAULT_BLOCK_CLASSES: Required<BlockClasses> = {
  heading: "text-xs font-bold uppercase tracking-[0.14em] text-slate-500",
  title: "font-semibold text-slate-900",
  meta: "text-xs text-slate-500",
  body: "text-[0.82rem] leading-relaxed text-slate-700",
};

const SECTION_LABELS: Record<SectionKey, string> = {
  personal: "",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  volunteer: "Volunteer",
  custom: "",
};

function Heading({ label, className }: { label: string; className: string }) {
  return (
    <h2 className={`${className} mb-2`}>{label}</h2>
  );
}

function Period({ text }: { text: string }) {
  if (!text) return null;
  return <span className={DEFAULT_BLOCK_CLASSES.meta}>{text}</span>;
}

function BulletedItemTitle({
  title,
  after,
  className,
}: {
  title: string;
  after?: string;
  className: string;
}) {
  return (
    <p className={className}>
      {title}
      {after ? <span className="font-normal text-slate-700"> · {after}</span> : null}
    </p>
  );
}

function SectionHeadingRow({
  label,
  classes,
}: {
  label: string;
  classes: Required<BlockClasses>;
}) {
  return <Heading label={label} className={classes.heading} />;
}

export function SectionBlock({
  data,
  section,
  classes = DEFAULT_BLOCK_CLASSES,
}: {
  data: ResumeData;
  section: SectionKey;
  classes?: Partial<BlockClasses>;
}) {
  const c: Required<BlockClasses> = { ...DEFAULT_BLOCK_CLASSES, ...classes };

  switch (section) {
    case "summary":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.summary} classes={c} />
          <p className={`${c.body} whitespace-pre-wrap`}>{data.summary}</p>
        </section>
      );

    case "experience":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.experience} classes={c} />
          {data.experience.map((item) => (
            <div key={item.id} className="mb-3 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-3">
                <BulletedItemTitle title={item.role} after={item.company} className={c.title} />
                <Period text={formatPeriod(item.period)} />
              </div>
              {item.location ? <p className={c.meta}>{item.location}</p> : null}
              <Bullets items={item.bullets} />
            </div>
          ))}
        </section>
      );

    case "education":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.education} classes={c} />
          {data.education.map((item) => (
            <div key={item.id} className="mb-3 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-3">
                <p className={c.title}>
                  {item.school || item.degree ? (
                    <>
                      {item.school}
                      {item.school && item.degree ? <span className="font-normal text-slate-700"> — {item.degree}</span> : item.degree ? item.degree : null}
                      {item.field ? (
                        <span className="font-normal italic text-slate-700">
                          , {item.field}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </p>
                <Period text={formatPeriod(item.period)} />
              </div>
              {item.location ? <p className={c.meta}>{item.location}</p> : null}
            </div>
          ))}
        </section>
      );

    case "projects":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.projects} classes={c} />
          {data.projects.map((item) => (
            <div key={item.id} className="mb-3 break-inside-avoid">
              <div className="flex items-baseline gap-2">
                <p className={c.title}>{item.name}</p>
                {item.link ? (
                  <a
                    href={item.link}
                    className={`${c.meta} break-all underline-offset-2 hover:underline`}
                  >
                    {item.link.replace(/^https?:\/\//i, "")}
                  </a>
                ) : null}
              </div>
              <Bullets items={item.bullets} />
            </div>
          ))}
        </section>
      );

    case "skills":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.skills} classes={c} />
          <p className={c.body}>
            {data.skills
              .map((skill) => skill.trim())
              .filter(Boolean)
              .join(" · ")}
          </p>
        </section>
      );

    case "certifications":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.certifications} classes={c} />
          {data.certifications.map((item) => (
            <p key={item.id} className={c.body}>
              <span className={c.title}>{item.name}</span>
              {item.issuer ? <span className={c.meta}> — {item.issuer}</span> : null}
              {item.year ? <span className={c.meta}> · {item.year}</span> : null}
            </p>
          ))}
        </section>
      );

    case "languages":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.languages} classes={c} />
          {data.languages.map((item) => (
            <p key={item.id} className={c.body}>
              <span className={c.title}>{item.name}</span>
              {item.level ? <span className={c.meta}> — {item.level}</span> : null}
            </p>
          ))}
        </section>
      );

    case "awards":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.awards} classes={c} />
          {data.awards.map((item) => (
            <p key={item.id} className={c.body}>
              <span className={c.title}>{item.title}</span>
              {item.issuer ? <span className={c.meta}> — {item.issuer}</span> : null}
              {item.year ? <span className={c.meta}> · {item.year}</span> : null}
            </p>
          ))}
        </section>
      );

    case "volunteer":
      return (
        <section>
          <SectionHeadingRow label={SECTION_LABELS.volunteer} classes={c} />
          {data.volunteer.map((item) => (
            <div key={item.id} className="mb-3 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-3">
                <BulletedItemTitle title={item.role} after={item.organization} className={c.title} />
                <Period text={formatPeriod(item.period)} />
              </div>
              <Bullets items={item.bullets} />
            </div>
          ))}
        </section>
      );

    case "custom":
      return (
        <>
          {data.customSections.map((customSection) => (
            <section key={customSection.id} className="mb-3 break-inside-avoid">
              <SectionHeadingRow label={customSection.title} classes={c} />
              <Bullets items={customSection.entries} className="mt-0" />
            </section>
          ))}
        </>
      );

    default:
      return null;
  }
}

export function Blocks({
  data,
  classes,
  exclude = [],
}: {
  data: ResumeData;
  classes?: Partial<BlockClasses>;
  exclude?: SectionKey[];
}) {
  const sections = documentSections(data).filter((key) => !exclude.includes(key));
  return (
    <div className="flex flex-col gap-4">
      {sections.map((key) => (
        <SectionBlock key={key} data={data} section={key} classes={classes} />
      ))}
    </div>
  );
}
