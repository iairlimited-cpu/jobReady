import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/app/(marketing)/_components/page-header";
import { CtaBand } from "@/app/(marketing)/_components/cta-band";
import { tools, type ToolDef } from "@/config/tools";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free job-application tools: CV builder, cover letter builder, job description analyzer, application checklist, interview preparation and more — rolling out now.",
};

function ToolCard({ tool }: { tool: ToolDef }) {
  const isLive = tool.status === "live";

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <Badge variant={isLive ? "success" : "neutral"}>
          {isLive ? "Free" : "Free — coming soon"}
        </Badge>
      </div>
      <h2 className="text-lg font-semibold text-foreground">{tool.name}</h2>
      <p className="text-sm font-medium text-primary-soft-foreground/80">{tool.short}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {tool.description}
      </p>
    </>
  );

  if (isLive) {
    return (
      <li>
        <LinkButton
          href={tool.href}
          variant="ghost"
          className="h-auto w-full flex-col items-start gap-3 whitespace-normal rounded-lg border border-border bg-card p-6 text-left hover:border-primary/40 hover:bg-card"
        >
          {content}
        </LinkButton>
      </li>
    );
  }

  return (
    <li>
      <Card className="flex h-full flex-col gap-3 p-6">{content}</Card>
    </li>
  );
}

export default function ToolsPage() {
  const liveCount = tools.filter((t) => t.status === "live").length;

  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="The JOBREADY toolkit"
        description="Free tools that work together: build your CV, understand the job, prepare your documents, and get ready for the interview."
      />
      <Container className="py-14">
        <div className="mb-10 max-w-3xl rounded-lg border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Honest progress, no hype.</p>
          <p className="mt-1">
            JOBREADY is being built in stages, one tool at a time.{" "}
            {liveCount === 0
              ? "The tools below are next in line and will be free the moment they ship — starting with the CV builder."
              : `${liveCount} of these tools are live today; the rest are shipping in order.`}{" "}
            Every tool shares your data, so nothing you create is ever siloed or lost.
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </ul>
      </Container>
      <CtaBand />
    </>
  );
}
