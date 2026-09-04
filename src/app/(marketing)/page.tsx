import type { ReactNode } from "react";

import { AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaBand } from "@/app/(marketing)/_components/cta-band";
import { coreFaqs } from "@/config/faqs";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const workflowSteps = [
  {
    number: "01",
    title: "Build your CV",
    text: "Structured sections, professional templates, and a page-accurate preview.",
    href: "/tools",
  },
  {
    number: "02",
    title: "Match it to the job",
    text: "Analyze the job description and see which requirements your CV clearly shows.",
    href: "/tools",
  },
  {
    number: "03",
    title: "Prepare your application",
    text: "Cover letter, required documents, and a checklist that says when you're ready.",
    href: "/tools",
  },
  {
    number: "04",
    title: "Track your application",
    text: "Status, deadlines, and timeline events — no more wondering where things stand.",
    href: "/tools",
  },
  {
    number: "05",
    title: "Prepare for the interview",
    text: "Questions, STAR answers, and a preparation checklist for the day itself.",
    href: "/tools",
  },
] as const;

const needs = [
  {
    icon: "file",
    title: "Create a CV",
    text: "Build a structured, professional CV from scratch — no template maze required.",
  },
  {
    icon: "target",
    title: "Tailor my CV",
    text: "See what a specific job asks for and adjust your CV to show it clearly and honestly.",
  },
  {
    icon: "pen",
    title: "Write a cover letter",
    text: "Focused letters with guided structure and sensible drafting help.",
  },
  {
    icon: "checklist",
    title: "Prepare a job application",
    text: "One workspace per job: requirements, documents, checklist, and readiness.",
  },
  {
    icon: "track",
    title: "Track applications",
    text: "Statuses, deadlines, notes, and a timeline of everything that happens.",
  },
  {
    icon: "chat",
    title: "Prepare for an interview",
    text: "Curated questions, STAR practice, and prep checklists for the big day.",
  },
] as const;

const howItWorks = [
  {
    step: "1",
    title: "Paste the job",
    text: "Add the job you found and paste its description. JOBREADY turns it into a clear list of what the employer is asking for.",
  },
  {
    step: "2",
    title: "Build & match your CV",
    text: "Create or edit your CV and see, requirement by requirement, what it already shows and what you could strengthen.",
  },
  {
    step: "3",
    title: "Track to the offer",
    text: "Submit, follow deadlines, log interviews, and keep every next step organized until the outcome.",
  },
] as const;

const privacyPoints = [
  {
    title: "Private by default",
    text: "Your CVs, applications, and notes are yours alone. They are never public, never listed, and only you can open them.",
  },
  {
    title: "You stay in control",
    text: "Delete any CV, application, or document whenever you like — and your whole account with it.",
  },
  {
    title: "Content stays out of analytics",
    text: "Analytics record activity like “CV exported,” never the text of your CV, cover letter, or notes.",
  },
] as const;

/* FAQ content lives in src/config/faqs.ts (shared with /faq). */

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-16 sm:py-24", className)}>
      <Container>{children}</Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */

function HeroPanel() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-3 -z-10 rounded-2xl bg-primary-soft/60 blur-2xl" />
      <Card className="overflow-hidden p-0 shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Software Engineer</p>
              <p className="text-sm text-muted-foreground">Northwind Labs · Remote</p>
            </div>
            <Badge variant="warning">Preparing</Badge>
          </div>
        </div>
        <dl className="flex flex-col gap-4 px-6 py-6">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">CV</dt>
            <dd className="inline-flex items-center gap-1 font-medium text-success-foreground">
              <CheckIcon className="size-4 text-success" /> Ready
            </dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">Cover letter</dt>
            <dd className="inline-flex items-center gap-1 font-medium text-success-foreground">
              <CheckIcon className="size-4 text-success" /> Ready
            </dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">Checklist</dt>
            <dd className="font-medium text-foreground">4 of 5 done</dd>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">Match with job</dt>
              <dd className="font-medium text-foreground">8 of 11 requirements shown</dd>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
              role="presentation"
            >
              <div className="h-full w-[73%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between rounded-md bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
            <span>Interview scheduled</span>
            <span className="font-medium text-foreground">Thu, 10:00 AM</span>
          </div>
        </dl>
      </Card>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-muted/50">
      <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="primary">Your job application, organized</Badge>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Get your job application{" "}
            <span className="text-primary">ready</span>.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Create your CV, tailor your application, organize your documents, track
            applications, and prepare for interviews — all in one place.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/tools" size="lg">
              Start My Application
            </LinkButton>
            <LinkButton href="/tools" variant="outline" size="lg">
              Create a CV
            </LinkButton>
          </div>
          <p className="text-sm text-muted-foreground">
            Free to start · No account needed to try the tools · Your data stays private
          </p>
        </div>
        <HeroPanel />
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Workflow                                                             */
/* ------------------------------------------------------------------ */

function Workflow() {
  return (
    <Section id="workflow">
      <SectionHeading
        eyebrow="From job found to job ready"
        title="One clear path from “I found a job” to “I applied.”"
        description="No scattered tabs, no lost documents, no guesswork about what comes next."
      />
      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {workflowSteps.map((step) => (
          <li key={step.number} className="flex">
            <LinkButton
              href={step.href}
              variant="ghost"
              className="h-auto w-full whitespace-normal flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 text-left hover:border-primary/40 hover:bg-card"
            >
              <span className="text-sm font-bold text-primary">{step.number}</span>
              <span className="text-base font-semibold text-foreground">
                {step.title}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </span>
            </LinkButton>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* What do you need                                                    */
/* ------------------------------------------------------------------ */

const needIcons: Record<string, ReactNode> = {
  file: (
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </>
  ),
  pen: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  checklist: (
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>
  ),
  track: (
    <>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </>
  ),
  chat: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </>
  ),
};

function NeedIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="size-6 text-primary"
      aria-hidden="true"
    >
      {needIcons[name]}
    </svg>
  );
}

function WhatYouNeed() {
  return (
    <Section id="tools" className="bg-muted/40">
      <SectionHeading
        eyebrow="What do you need?"
        title="Pick where you want to start."
        description="Every path below lands in the same workspace — so the work you do in one place carries into the next."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {needs.map((item) => (
          <Card
            key={item.title}
            className="flex flex-col gap-4 p-6 transition-colors hover:border-primary/40"
          >
            <span className="grid size-11 place-items-center rounded-md bg-primary-soft">
              <NeedIcon name={item.icon} />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow="How JOBREADY works"
        title="Three steps from job description to job offer."
        description="The whole loop lives in one place, and each step tells you exactly what to do next."
      />
      <ol className="mt-14 grid gap-6 lg:grid-cols-3">
        {howItWorks.map((item, index) => (
          <li key={item.step} className="relative flex">
            <Card className="flex w-full flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  {item.step}
                </span>
                {index < howItWorks.length - 1 ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="hidden size-5 text-primary lg:block"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                ) : null}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy                                                              */
/* ------------------------------------------------------------------ */

function Privacy() {
  return (
    <Section id="privacy" className="bg-muted/40">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHeading
          align="left"
          eyebrow="Privacy & security"
          title="Your career data is personal. We treat it that way."
          description="JOBREADY is built so that private information stays private — by default, not by request."
        />
        <ul className="flex flex-col gap-4">
          {privacyPoints.map((point) => (
            <li
              key={point.title}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-5"
            >
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success-soft">
                <CheckIcon className="size-3.5 text-success-foreground" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground">{point.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {point.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */

function Faq() {
  return (
    <Section id="faq">
      <SectionHeading
        eyebrow="Questions"
        title="Frequently asked questions"
        description="Straight answers — no fine print, no dark patterns."
      />
      <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
        {coreFaqs.map((faq) => (
          <AccordionItem key={faq.question} question={faq.question}>
            {faq.answer}
          </AccordionItem>
        ))}
      </div>
      <div className="mt-10 text-center">
        <LinkButton href="/faq" variant="ghost">
          Read all questions on the FAQ page
        </LinkButton>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <>
      <Hero />
      <Workflow />
      <WhatYouNeed />
      <HowItWorks />
      <Privacy />
      <Faq />
      <CtaBand />
    </>
  );
}
