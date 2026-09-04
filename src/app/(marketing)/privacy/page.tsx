import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/app/(marketing)/_components/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How JOBREADY handles your data: private by default, no content in analytics, easy deletion and export.",
};

const sections: { title: string; body: string[] }[] = [
  {
    title: "The short version",
    body: [
      "JOBREADY is designed so that your career information is private by default. Your resumes, applications, cover letters, notes, and documents are accessible only to you. We do not sell personal data, and we do not send the content of your documents into analytics.",
      "This page explains what we collect, why, and the controls you have. It may be refined before the public launch; material changes will be announced here.",
    ],
  },
  {
    title: "What we collect",
    body: [
      "Account information: the email address and name you sign up with, plus any profile details you choose to add (such as your country or professional title).",
      "Content you create: your resumes, applications, cover letters, notes, checklists, and any documents you upload. This content is stored so it can be saved and synced across your devices.",
      "Activity events: technical, content-free events such as “resume created” or “PDF exported,” used only to understand how the product is used and to fix problems. These events never include your document text.",
    ],
  },
  {
    title: "How we use your data",
    body: [
      "To provide the service: saving your work, letting you sign in, and syncing across devices.",
      "To improve the product: analyzing aggregate, content-free activity. We do not read your resumes or notes to target you or train features.",
    ],
  },
  {
    title: "Service providers",
    body: [
      "JOBREADY is built on Firebase (a Google service) for authentication, database, and — when file storage is enabled — document storage. Firebase hosts and secures this data on our behalf under its own security commitments. We do not sell your data to any third party.",
    ],
  },
  {
    title: "Who can see your content",
    body: [
      "Only you can access your resumes, applications, cover letters, notes, and documents. Nothing you create is published or exposed through public or guessable links. Technical safeguards (documented in our architecture) enforce that only your own account can read or write your data.",
    ],
  },
  {
    title: "Analytics and consent",
    body: [
      "Where analytics is enabled, it records activity only — never the content you type. Where required by law, we ask for consent before analytics runs, and you can disable it in settings.",
    ],
  },
  {
    title: "Retention, export, and deletion",
    body: [
      "You can delete any resume, application, cover letter, or uploaded document at any time, and the deletion removes it from our systems.",
      "Deleting your account removes your account and your content. An export of your data for portability is planned.",
    ],
  },
  {
    title: "Security",
    body: [
      "Data is encrypted in transit. Access to your data is controlled by rules that allow only your account to read or write it. We keep your content out of logs and out of analytics.",
    ],
  },
  {
    title: "Questions",
    body: [
      `If you have a question about privacy, contact us at ${siteConfig.email}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="Privacy policy"
        description="A plain-language explanation of what JOBREADY collects, why, and how you stay in control."
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
