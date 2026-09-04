/**
 * Deterministic job-description analyzer (JOBREADY-PLAN.md §A10, §99).
 * Pure TypeScript — no network, no AI. Output is fully explainable via
 * evidence snippets.
 */
import {
  MUST_TERMS,
  SKILL_LEXICON,
  SPOKEN_LANGUAGE_LEXICON,
} from "@/config/skills";
import type {
  AnalysisResult,
  ExtractedRequirement,
  Importance,
  RequirementCategory,
} from "@/features/analyzer/types";

export const MAX_ANALYZER_LENGTH = 50_000;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function sentenceFor(text: string, token: string): string[] {
  const needle = token.toLowerCase();
  const matches = splitSentences(text).filter((sentence) =>
    sentence.toLowerCase().includes(needle),
  );
  if (matches.length > 0) return matches.slice(0, 3).map(capSentence);
  return [capSentence(text.slice(0, 200))];
}

function capSentence(sentence: string): string {
  const cleaned = sentence.replace(/\s+/g, " ").trim();
  return cleaned.length > 220 ? `${cleaned.slice(0, 220)}…` : cleaned;
}

function importanceFor(sentence: string): Importance {
  const lower = sentence.toLowerCase();
  return MUST_TERMS.some((term) => lower.includes(term)) ? "must" : "unknown";
}

function addRequirement(
  list: ExtractedRequirement[],
  labels: Set<string>,
  category: RequirementCategory,
  label: string,
  importance: Importance,
  evidence: string[],
  normalized?: string,
): void {
  const key = `${category}|${label.toLowerCase()}`;
  if (labels.has(key)) return;
  labels.add(key);
  list.push({
    id: `req-${list.length + 1}`,
    category,
    label: label.trim().replace(/\s+/g, " "),
    normalized: normalized ?? label.toLowerCase(),
    evidence,
    importance,
  });
}

interface LexiconEntryLike {
  label: string;
  aliases: string[];
}

function matchLexicon(
  text: string,
  normalized: string,
  entries: LexiconEntryLike[],
  category: RequirementCategory,
  out: ExtractedRequirement[],
  labels: Set<string>,
  options?: { requireContext?: string[] },
): void {
  for (const entry of entries) {
    for (const alias of entry.aliases) {
      if (alias.length < 3) continue;
      const pattern = new RegExp(`\\b${escapeRegExp(alias)}\\b`);
      if (!pattern.test(normalized)) continue;
      if (options?.requireContext) {
        const contextOk = splitSentences(text).some((sentence) => {
          const lower = sentence.toLowerCase();
          return (
            lower.includes(alias) &&
            options.requireContext!.some((word) => lower.includes(word))
          );
        });
        if (!contextOk) continue;
      }
      const evidence = sentenceFor(text, alias);
      addRequirement(
        out,
        labels,
        category,
        entry.label,
        importanceFor(evidence[0] ?? ""),
        evidence,
      );
      break;
    }
  }
}

function extractExperience(
  text: string,
  normalized: string,
  out: ExtractedRequirement[],
  labels: Set<string>,
): void {
  const yearMatches = [
    ...normalized.matchAll(
      /(\d{1,2})\+?\s*[-–to]?\s*(?:\d{1,2}\s*[-–to]\s*)?years?/g,
    ),
  ];
  for (const match of yearMatches) {
    const phrase = match[0].trim().replace(/\s+/g, " ");
    addRequirement(
      out,
      labels,
      "experience",
      phrase,
      importanceFor(match.input?.slice(Math.max(0, match.index ?? 0), (match.index ?? 0) + 200) ?? ""),
      sentenceFor(text, phrase),
    );
  }
  const seniority = [
    "junior",
    "mid-level",
    "mid level",
    "senior",
    "staff",
    "lead",
    "principal",
  ];
  for (const level of seniority) {
    const pattern = new RegExp(`\\b${escapeRegExp(level)}\\b`);
    if (!pattern.test(normalized)) continue;
    const evidence = sentenceFor(text, level);
    addRequirement(
      out,
      labels,
      "experience",
      level
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-"),
      importanceFor(evidence[0] ?? ""),
      evidence,
    );
  }
}

// NOTE: intentionally NOT global — exec() must stay stateless across calls.
const DEGREE_PATTERNS = [
  /bachelor'?s? degree/i,
  /master'?s? degree/i,
  /associate'?s? degree/i,
  /ph\.?\s?d/i,
  /doctorate/i,
  /mba/i,
];

function extractEducation(
  text: string,
  out: ExtractedRequirement[],
  labels: Set<string>,
): void {
  for (const pattern of DEGREE_PATTERNS) {
    const match = pattern.exec(text);
    if (!match) continue;
    let label = match[0].replace(/\s+/g, " ").trim();
    const lower = text.toLowerCase();
    if (lower.includes("or equivalent")) {
      label = label.endsWith("degree")
        ? `${label} or equivalent`
        : label;
    }
    const evidence = sentenceFor(text, label);
    addRequirement(
      out,
      labels,
      "education",
      label,
      importanceFor(evidence[0] ?? ""),
      evidence,
      label.toLowerCase(),
    );
  }
}

function extractCertifications(
  text: string,
  out: ExtractedRequirement[],
  labels: Set<string>,
): void {
  const pattern =
    /((?:[A-Z][\w&.'-]*\s*){1,3}(?:certification|certified|certificate)s?)/gi;
  for (const match of text.matchAll(pattern)) {
    const full = match[1].trim().replace(/\s+/g, " ");
    if (full.length < 4 || full.length > 80) continue;
    // Drop trailing words that are clearly generic ("a certification").
    if (/^(a |an |the )/.test(full)) continue;
    addRequirement(
      out,
      labels,
      "certification",
      full,
      "unknown",
      sentenceFor(text, full),
    );
  }
}

function extractResponsibilities(
  text: string,
  out: ExtractedRequirement[],
  labels: Set<string>,
): void {
  const bullets = text.match(/(?:^|\n)\s*[•▪◦-]\s+([^\n]+)/g) ?? [];
  if (bullets.length === 0) return;
  for (const bullet of bullets) {
    const clean = bullet
      .replace(/^[\s•▪◦-]+/, "")
      .replace(/[.;,]+$/, "")
      .trim();
    if (clean.length < 3) continue;
    const sentence = capSentence(clean);
    addRequirement(
      out,
      labels,
      "responsibility",
      sentence,
      "unknown",
      [sentence],
    );
  }
}

const QUALIFICATION_PHRASES = [
  "must have",
  "required",
  "knowledge of",
  "experience with",
  "experience in",
  "experience using",
  "proficiency in",
  "expertise in",
  "familiarity with",
  "hands-on experience with",
  "deep understanding of",
  "strong understanding of",
];

function extractQualificationPhrases(
  text: string,
  out: ExtractedRequirement[],
  labels: Set<string>,
): void {
  const normalized = normalizeText(text);
  for (const phrase of QUALIFICATION_PHRASES) {
    const pattern = new RegExp(
      `${escapeRegExp(phrase)}\\s+([a-z][a-z0-9 /&+#.-]{2,80}?)(?=,|\\.|;|\\n| and | or |$)` ,
      "gi",
    );
    for (const match of normalized.matchAll(pattern)) {
      const raw = match[1].trim().replace(/\s+/g, " ");
      if (!raw || /^\d+[\d\s]*$/.test(raw)) continue;
      if (/^(with|in|using|of|for)\b/.test(raw)) continue;
      // Skip when the phrase is already a matched technology/skill.
      const normalizedCandidates = new Set(
        out.map((item) => (item.normalized ?? item.label).toLowerCase()),
      );
      if (normalizedCandidates.has(raw.toLowerCase())) continue;
      addRequirement(
        out,
        labels,
        "qualification",
        raw.charAt(0).toUpperCase() + raw.slice(1),
        "must",
        sentenceFor(text, raw),
      );
    }
  }
}

function extractKeywords(
  text: string,
  out: ExtractedRequirement[],
  labels: Set<string>,
): void {
  // Pragmatic: surface capitalized, uncommon tech-ish tokens in requirement
  // sentences that aren't already matched. Lowercase stopwords are ignored.
  const stop = new Set([
    "the","and","for","with","you","our","we","will","are","have","has","role","team",
    "job","work","skills","including","such","etc","using","strong","ability","able",
  ]);
  const candidates = new Map<string, string>();
  for (const sentence of splitSentences(text)) {
    const lower = sentence.toLowerCase();
    if (!MUST_TERMS.some((term) => lower.includes(term)) && !/certification|degree|years? of experience/i.test(sentence)) {
      continue;
    }
    for (const token of sentence.match(/\b[A-Z][A-Za-z0-9+#.]{2,}\b/g) ?? []) {
      const key = token.toLowerCase();
      if (stop.has(key)) continue;
      const alreadyMatched = new Set(
        out.map((item) => (item.normalized ?? item.label).toLowerCase()),
      );
      if (alreadyMatched.has(key)) continue;
      const existing = candidates.get(key);
      if (!existing) candidates.set(key, capSentence(sentence));
    }
  }
  for (const [token, sentence] of candidates) {
    const pretty = token.replace(/\b\w/g, (letter) => letter.toUpperCase());
    addRequirement(
      out,
      labels,
      "keyword",
      pretty,
      importanceFor(sentence),
      [sentence],
      token,
    );
  }
}

/** Analyzes a job description into structured, evidence-backed requirements. */
export function analyzeJobDescription(text: string): AnalysisResult {
  const original = text.trim();
  const requirements: ExtractedRequirement[] = [];
  const labels = new Set<string>();

  if (original.length === 0) {
    return { requirements: [], analyzedAt: Date.now() };
  }

  const normalized = normalizeText(original);

  // Spoken languages (only in a language context to avoid false positives).
  matchLexicon(original, normalized, SPOKEN_LANGUAGE_LEXICON, "language", requirements, labels, {
    requireContext: ["speak", "fluent", "language", "verbal", "written", "bilingual", "english"],
  });

  // Tech / hard skills / soft skills.
  for (const entry of SKILL_LEXICON) {
    const category: RequirementCategory =
      entry.category === "technology"
        ? "technology"
        : entry.category === "skill"
          ? "skill"
          : "soft_skill";
    matchLexicon(original, normalized, [entry], category, requirements, labels);
  }

  extractExperience(original, normalized, requirements, labels);
  extractEducation(original, requirements, labels);
  extractCertifications(original, requirements, labels);
  extractResponsibilities(original, requirements, labels);
  extractQualificationPhrases(original, requirements, labels);
  extractKeywords(original, requirements, labels);

  // Responsibilities and keyword passes may add noise — cap requirements.
  const capped = requirements.slice(0, 120);

  return { requirements: capped, analyzedAt: Date.now() };
}
