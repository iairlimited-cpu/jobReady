/**
 * Deterministic skill lexicon for the job analyzer (JOBREADY-PLAN.md §A10).
 * Canonical labels keep aliases (react.js → react) consistent for matching.
 */

export type LexiconCategory = "technology" | "skill" | "soft_skill";

export interface LexiconEntry {
  /** Canonical label shown to users and used for matching. */
  label: string;
  /** Normalized alias list (lowercase). */
  aliases: string[];
  category: LexiconCategory;
}

const entry = (
  label: string,
  aliases: string[],
  category: LexiconCategory,
): LexiconEntry => ({ label, aliases: [label.toLowerCase(), ...aliases], category });

export const SKILL_LEXICON: LexiconEntry[] = [
  // Frontend
  entry("React", ["react", "reactjs", "react.js"], "technology"),
  entry("React Native", ["react native"], "technology"),
  entry("Next.js", ["nextjs", "next.js"], "technology"),
  entry("TypeScript", ["typescript", "ts"], "technology"),
  entry("JavaScript", ["javascript", "js", "es6", "ecmascript"], "technology"),
  entry("HTML", ["html", "html5"], "technology"),
  entry("CSS", ["css", "css3"], "technology"),
  entry("Tailwind CSS", ["tailwind", "tailwindcss"], "technology"),
  entry("Sass", ["sass", "scss"], "technology"),
  entry("Vue", ["vue", "vuejs", "vue.js"], "technology"),
  entry("Angular", ["angular", "angularjs"], "technology"),
  entry("Svelte", ["svelte", "sveltekit"], "technology"),
  entry("Redux", ["redux"], "technology"),
  entry("GraphQL", ["graphql"], "technology"),
  entry("Web accessibility", ["accessibility", "a11y", "wcag"], "skill"),
  entry("Responsive design", ["responsive design", "responsive web"], "skill"),
  entry("Design systems", ["design system", "design systems"], "skill"),
  entry("Testing", ["testing"], "skill"),
  // Backend
  entry("Node.js", ["node", "nodejs", "node.js"], "technology"),
  entry("Python", ["python"], "technology"),
  entry("Django", ["django"], "technology"),
  entry("Flask", ["flask"], "technology"),
  entry("Java", ["java"], "technology"),
  entry("Spring", ["spring boot", "spring"], "technology"),
  entry("Go", ["golang", "go"], "technology"),
  entry("Ruby", ["ruby on rails", "rails", "ruby"], "technology"),
  entry("PHP", ["php", "laravel"], "technology"),
  entry("C#", ["c#", "csharp", ".net", "dotnet"], "technology"),
  entry("C++", ["c++", "cpp"], "technology"),
  entry("Rust", ["rust"], "technology"),
  entry("Kotlin", ["kotlin"], "technology"),
  entry("Swift", ["swift"], "technology"),
  entry("SQL", ["sql"], "technology"),
  entry("REST APIs", ["rest api", "restful", "rest apis", "rest"], "technology"),
  entry("Microservices", ["microservice", "microservices"], "skill"),
  entry("API design", ["api design"], "skill"),
  // Data & ML
  entry("Data analysis", ["data analysis"], "skill"),
  entry("Pandas", ["pandas"], "technology"),
  entry("NumPy", ["numpy"], "technology"),
  entry("Machine learning", ["machine learning", "ml"], "skill"),
  entry("Deep learning", ["deep learning"], "skill"),
  entry("PyTorch", ["pytorch"], "technology"),
  entry("TensorFlow", ["tensorflow", "tensor flow"], "technology"),
  entry("Data visualization", ["data visualization", "dataviz"], "skill"),
  entry("ETL", ["etl"], "technology"),
  entry("BigQuery", ["bigquery"], "technology"),
  entry("Spark", ["apache spark", "spark"], "technology"),
  entry("Statistics", ["statistics"], "skill"),
  entry("A/B testing", ["a/b testing", "ab testing"], "skill"),
  // Cloud & DevOps
  entry("AWS", ["aws", "amazon web services"], "technology"),
  entry("Azure", ["azure"], "technology"),
  entry("Google Cloud", ["google cloud", "gcp"], "technology"),
  entry("Docker", ["docker"], "technology"),
  entry("Kubernetes", ["kubernetes", "k8s"], "technology"),
  entry("CI/CD", ["ci/cd", "cicd", "continuous integration"], "skill"),
  entry("Terraform", ["terraform"], "technology"),
  entry("Linux", ["linux", "unix"], "technology"),
  entry("Bash", ["bash", "shell scripting"], "technology"),
  entry("Git", ["git", "version control"], "technology"),
  entry("GitHub", ["github", "github actions"], "technology"),
  entry("Monitoring", ["monitoring", "observability"], "skill"),
  entry("Firebase", ["firebase"], "technology"),
  entry("Serverless", ["serverless"], "technology"),
  // Testing / quality
  entry("Unit testing", ["unit test", "unit testing"], "skill"),
  entry("Integration testing", ["integration test", "integration testing"], "skill"),
  entry("End-to-end testing", ["end to end testing", "e2e", "e2e testing"], "skill"),
  entry("Cypress", ["cypress"], "technology"),
  entry("Jest", ["jest"], "technology"),
  entry("Playwright", ["playwright"], "technology"),
  entry("QA", ["quality assurance", "qa"], "skill"),
  // Methodologies / workplace
  entry("Agile", ["agile"], "skill"),
  entry("Scrum", ["scrum"], "skill"),
  entry("Kanban", ["kanban"], "skill"),
  entry("Code review", ["code review", "code reviews"], "skill"),
  entry("Technical documentation", ["documentation", "technical writing"], "skill"),
  entry("Project management", ["project management"], "skill"),
  entry("Product management", ["product management"], "skill"),
  entry("UI/UX design", ["ux", "ui design", "user experience", "user interface", "figma"], "skill"),
  entry("SQL databases", ["relational databases", "postgresql", "postgres", "mysql"], "technology"),
  entry("NoSQL", ["nosql", "mongodb", "dynamodb"], "technology"),
  entry("Redis", ["redis"], "technology"),
  entry("Elasticsearch", ["elasticsearch"], "technology"),
  // Soft skills
  entry("Communication", ["communication", "communicating"], "soft_skill"),
  entry("Teamwork", ["teamwork", "cross-functional collaboration", "collaboration"], "soft_skill"),
  entry("Leadership", ["leadership"], "soft_skill"),
  entry("Problem solving", ["problem solving", "problem-solving"], "soft_skill"),
  entry("Critical thinking", ["critical thinking"], "soft_skill"),
  entry("Time management", ["time management", "time-management"], "soft_skill"),
  entry("Mentoring", ["mentoring", "mentorship"], "soft_skill"),
  entry("Attention to detail", ["attention to detail"], "soft_skill"),
  entry("Adaptability", ["adaptability", "adapt quickly"], "soft_skill"),
  entry("Stakeholder management", ["stakeholder management"], "soft_skill"),
];

/** Spoken languages (distinct from programming languages). */
export const SPOKEN_LANGUAGE_LEXICON: LexiconEntry[] = [
  entry("English", ["english"], "soft_skill"),
  entry("French", ["french"], "soft_skill"),
  entry("Spanish", ["spanish"], "soft_skill"),
  entry("German", ["german"], "soft_skill"),
  entry("Portuguese", ["portuguese"], "soft_skill"),
  entry("Italian", ["italian"], "soft_skill"),
  entry("Swahili", ["swahili", "kiswahili"], "soft_skill"),
  entry("Arabic", ["arabic"], "soft_skill"),
  entry("Mandarin Chinese", ["mandarin", "chinese"], "soft_skill"),
  entry("Hindi", ["hindi"], "soft_skill"),
  entry("Japanese", ["japanese"], "soft_skill"),
  entry("Dutch", ["dutch"], "soft_skill"),
];

/** Words that mark a requirement as mandatory. */
export const MUST_TERMS = [
  "must",
  "required",
  "requires",
  "requirement",
  "essential",
  "mandatory",
  "minimum",
];
