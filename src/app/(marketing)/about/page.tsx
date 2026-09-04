import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/app/(marketing)/_components/page-header";
import { CtaBand } from "@/app/(marketing)/_components/cta-band";

export const metadata: Metadata = {
  title: "About",
  description:
    "JOBREADY is a job application preparation workspace — not just another resume template site. Learn what we believe and how we build.",
};

const principles = [
  {
    title: "Preparation over templates",
    text: "A CV template is one small part of applying for a job. JOBREADY is a workspace that carries you from the job description to the interview — and keeps everything organized on the way.",
  },
  {
    title: "Honesty is a feature",
    text: "We will not fabricate achievements, inflate your experience, or sell you a “guaranteed hire” score. Our tools show your real experience as clearly and professionally as possible — nothing more, nothing fake.",
  },
  {
    title: "Private by default",
    text: "Your CVs, applications, notes, and documents belong to you. They are never public and never analyzed for marketing. You can delete any of it — or all of it — at any time.",
  },
  {
    title: "The product stays free where it matters",
    text: "The core loop — creating a CV, tailoring it to a job, exporting it, and tracking an application — should not be locked behind a paywall. If premium extras arrive later, the basics stay free.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="JOBREADY exists to reduce the stress of applying for jobs."
        description="Finding a job you want is only the beginning. Getting from “I found a job” to “I applied” — and through the interview — is a process of many small, uncertain steps. We build tools that make those steps clear."
      />

      <Container className="flex flex-col gap-14 py-14">
        <section className="grid items-start gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3 md:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Not just another resume website
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Many tools help you make a CV and then stop. Applying for a job is
              bigger than that: understanding what the employer actually asks for,
              making sure your CV shows it, preparing the documents, tracking where
              every application stands, and getting ready for interviews. JOBREADY
              treats all of that as one connected job — and one calm workspace.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              We deliberately do not build fake urgency, hidden paywalls, or inflated
              promises. If we cannot help you truthfully, we will not pretend we can.
            </p>
          </div>
          <LinkButton href="/#workflow" variant="outline" className="md:mt-2">
            See the workflow
          </LinkButton>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            What we build by
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {principles.map((principle) => (
              <Card key={principle.title} className="flex flex-col gap-3 p-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {principle.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {principle.text}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </Container>
      <CtaBand />
    </>
  );
}
