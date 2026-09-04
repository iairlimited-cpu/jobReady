/**
 * Pure cover-letter helpers — guided template scaffolding + honest, local
 * drafting suggestions. Never fabricates achievements or metrics.
 */
import type { CoverLetterData } from "@/features/coverLetter/types";

export function buildGuidedCoverLetter(input: {
  jobTitle: string;
  company: string;
  applicantName: string;
}): CoverLetterData {
  const company = input.company.trim() || "[company]";
  const role = input.jobTitle.trim() || "[role]";
  return {
    applicantName: input.applicantName,
    recipient: "Hiring Manager",
    salutation: "Dear Hiring Manager,",
    opening: `I’m writing to apply for the ${role} position at ${company}. Your posting caught my attention because the work matches where I want to grow.`,
    experience:
      `Here is what I can bring to ${company}:\n\n` +
      `• [One thing you did in a similar role, and the result]\n` +
      `• [A second concrete example — tools, team, or scope]\n` +
      `• [An outcome you’re proud of — include a number only if it’s true]`,
    whyRole: `What draws me to ${role} at ${company} is [why this role / this team / this company — be specific and honest].`,
    closingSalutation: "Sincerely,",
  };
}

const WEAK_OPENERS = [
  "i am writing to apply",
  "i am applying for",
  "i would like to apply",
  "please accept this letter",
];

const NUMERIC_EVIDENCE = /\d+\s*(%|years?|people|projects|users|customers|revenue|k\b|,?\d{3})/i;

export interface DraftTip {
  severity: "suggestion" | "warning";
  text: string;
}

export function suggestCoverLetterImprovements(letter: CoverLetterData): DraftTip[] {
  const tips: DraftTip[] = [];
  const body = [letter.opening, letter.experience, letter.whyRole].join("\n").trim();

  if (!letter.applicantName.trim()) {
    tips.push({
      severity: "warning",
      text: "Add your name so the signature line is complete.",
    });
  }

  if (letter.opening.trim()) {
    const opening = letter.opening.toLowerCase();
    if (WEAK_OPENERS.some((phrase) => opening.startsWith(phrase))) {
      tips.push({
        severity: "suggestion",
        text: "Your opening is a common cliché. Try connecting the role to something specific you’ve done.",
      });
    }
  }

  if (body.length < 300) {
    tips.push({
      severity: "suggestion",
      text: "The letter is quite short — add one concrete example from your experience.",
    });
  }

  if (letter.experience.trim() && !NUMERIC_EVIDENCE.test(letter.experience)) {
    tips.push({
      severity: "suggestion",
      text: "If you have a real, measurable result, mention it (e.g. “cut load time by 40%”). Only include numbers that are true.",
    });
  }

  if (letter.whyRole.trim() && /\[why|\[company|\[role/i.test(letter.whyRole)) {
    tips.push({
      severity: "warning",
      text: "Replace the remaining placeholders ([…]) with your own words.",
    });
  }

  return tips;
}

export function hasPlaceholders(letter: CoverLetterData): boolean {
  const text = [
    letter.opening,
    letter.experience,
    letter.whyRole,
    letter.recipient,
    letter.salutation,
  ].join("\n");
  return /\[[^\]]+\]/.test(text);
}
