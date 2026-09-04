import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/app/(marketing)/_components/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using JOBREADY — clear, honest, and readable.",
};

const sections: { title: string; body: string[] }[] = [
  {
    title: "What these terms cover",
    body: [
      "These terms govern your use of JOBREADY. By using the service you agree to them. They may be refined before public launch; material changes will be announced on this page.",
    ],
  },
  {
    title: "Using JOBREADY",
    body: [
      "JOBREADY is provided to help you prepare and manage job applications. You may use the public tools without an account. An account is only needed to save and sync your work.",
      "The service is currently in active development. Features may change, and we will not silently remove or lock features you rely on.",
    ],
  },
  {
    title: "Your content is yours",
    body: [
      "You own the resumes, applications, cover letters, notes, and documents you create. You grant us only the limited rights needed to store and display them to you.",
      "You are responsible for the accuracy of the information in your documents. JOBREADY helps you present your experience clearly and never fabricates experience, credentials, achievements, or metrics on your behalf. You decide what is true to include.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "Do not use JOBREADY for unlawful activity, to impersonate others, to upload malicious files, to attempt to access other users’ data, or to abuse the service (for example through automated scraping or excessive automated requests).",
    ],
  },
  {
    title: "No job guarantee",
    body: [
      "JOBREADY helps you prepare applications; it does not guarantee interviews, offers, or employment. No tool or service can promise that, and we do not.",
    ],
  },
  {
    title: "Availability and “as is”",
    body: [
      "The service is provided “as is” and “as available.” While we work to keep it reliable, we do not guarantee uninterrupted availability, and we are not liable for lost opportunities resulting from downtime or errors. You keep your own backups of anything critical.",
    ],
  },
  {
    title: "Our rights",
    body: [
      "The JOBREADY name, templates, and website design belong to us. Using the service does not give you rights to copy, resell, or redistribute the service itself.",
    ],
  },
  {
    title: "Termination",
    body: [
      "You can stop using JOBREADY at any time and delete your account, which removes your data. We may suspend accounts that seriously or repeatedly breach these terms.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "To the maximum extent permitted by law, JOBREADY is not liable for indirect or consequential damages arising from your use of the service.",
    ],
  },
  {
    title: "Contact",
    body: [`Questions about these terms? Email ${siteConfig.email}.`],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Terms"
        title="Terms of use"
        description="The ground rules for using JOBREADY, written to be readable."
      />
      <Container className="max-w-3xl py-14">
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {section.title}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
