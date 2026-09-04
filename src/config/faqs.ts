/**
 * Public FAQ content — single source for the homepage and /faq page.
 * Plain strings only (rendered as text) so JSON-LD stays in sync.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const coreFaqs: FaqEntry[] = [
  {
    question: "Do I need an account to use JOBREADY?",
    answer:
      "No. The tools are designed to work before you create an account. Sign up only when you want to save your work and keep it in sync across devices — and your guest drafts can be moved into your account when you do.",
  },
  {
    question: "Is my information private?",
    answer:
      "Yes. Your CVs, applications, cover letters, notes, and documents are accessible only to you. Nothing you write is published, exposed through public links, or sent into analytics.",
  },
  {
    question: "Does JOBREADY use AI to write my CV?",
    answer:
      "Not in the first version. The current tools are deterministic and transparent: they analyze, structure, and check your content, and they never invent experience, achievements, or metrics for you.",
  },
  {
    question: "Will JOBREADY guarantee I get the job?",
    answer:
      "No — and we won’t pretend otherwise. Nobody can promise that. What we do is help you present your real experience clearly, completely, and professionally so your application is as strong as it can honestly be.",
  },
  {
    question: "What resume formats are supported?",
    answer:
      "JOBREADY is designed for international use. You choose your country/region, date format, and terminology, and your CV can be laid out for A4 or US Letter before you export it as a PDF.",
  },
  {
    question: "What does JOBREADY cost?",
    answer:
      "The core tools are free to use. If a paid tier is added later, the basics — creating a CV, exporting it, tracking applications — will never be locked away behind it.",
  },
];

export const moreFaqs: FaqEntry[] = [
  {
    question: "Which browsers are supported?",
    answer:
      "The current versions of Chrome, Edge, Firefox, and Safari. PDF export uses your browser’s built-in print-to-PDF so the file always matches what you see on screen.",
  },
  {
    question: "Can I have more than one CV?",
    answer:
      "Yes. You can keep several versions (for example a general CV, an academic CV, or one tailored to a specific role) and duplicate any CV to make a new version.",
  },
  {
    question: "What happens if I delete an application or a CV?",
    answer:
      "It is removed from your account. We never silently keep or reuse deleted content. If a CV was attached to applications, those applications simply ask you to attach a CV again.",
  },
  {
    question: "Do you sell or share my data?",
    answer:
      "No. We do not sell personal data. Analytics are activity-only and contain none of your content. If that ever changes, you will be told clearly and given control first.",
  },
];

export const allFaqs: FaqEntry[] = [...coreFaqs, ...moreFaqs];
