/**
 * Cover letter data model. A letter belongs to an application (embedded on
 * the application doc) so the workspace can render + export it consistently.
 */
export interface CoverLetterData {
  /** Your name — shown in the signature line. */
  applicantName: string;
  /** Recipient line, e.g. "Hiring Manager". */
  recipient: string;
  salutation: string;
  opening: string;
  /** One or more short paragraphs showing relevant experience. */
  experience: string;
  /** Why this role/company. */
  whyRole: string;
  closingSalutation: string;
}

export const EMPTY_COVER_LETTER: CoverLetterData = {
  applicantName: "",
  recipient: "Hiring Manager",
  salutation: "Dear Hiring Manager,",
  opening: "",
  experience: "",
  whyRole: "",
  closingSalutation: "Sincerely,",
};
