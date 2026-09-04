import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/app/(marketing)/_components/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the JOBREADY team — questions, feedback, or issues.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        description="Found a bug, have feedback, or just want to ask something? We read everything."
      />
      <Container className="py-14">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          <Card className="flex flex-col gap-3 p-6">
            <h2 className="text-lg font-semibold text-foreground">Email us</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The fastest way to reach us. Please include a few details so we can
              help quickly.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {siteConfig.email}
            </a>
          </Card>
          <Card className="flex flex-col gap-3 p-6">
            <h2 className="text-lg font-semibold text-foreground">Before you write</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Many questions are already answered on the FAQ page — including how we
              handle privacy and what the tools cost.
            </p>
            <div className="mt-auto">
              <LinkButton href="/faq" variant="outline">
                Browse the FAQ
              </LinkButton>
            </div>
          </Card>
        </div>
      </Container>
    </>
  );
}
