import type { Metadata } from "next";

import { AccordionItem } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader } from "@/app/(marketing)/_components/page-header";
import { CtaBand } from "@/app/(marketing)/_components/cta-band";
import { allFaqs } from "@/config/faqs";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about JOBREADY: accounts, privacy, resume formats, AI, PDF export, pricing, and more.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      {/* Structured data for search engines. Static local data only. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Straight answers about how JOBREADY works, what it costs, and how we protect your data."
      />
      <Container className="py-14">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {allFaqs.map((faq) => (
            <AccordionItem key={faq.question} question={faq.question}>
              {faq.answer}
            </AccordionItem>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-start gap-2 rounded-lg border border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-foreground">Still have a question?</p>
            <p className="text-sm text-muted-foreground">
              We read every message and answer as quickly as we can.
            </p>
          </div>
          <LinkButton href="/contact" variant="outline">
            Contact us
          </LinkButton>
        </div>
      </Container>
      <CtaBand />
    </>
  );
}
