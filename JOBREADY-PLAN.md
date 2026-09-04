# JOBREADY — Master Architecture & UX Plan (First Deliverable)

**Status:** Planning (Phase 0). No production code written yet.
**Scope:** V1 per master prompt §1–§125. Everything below is a *decision*, not a suggestion. Confirmed choices are noted in §A0 and the closing decisions block.

---

## PART A — ARCHITECTURE PLAN

### A0. Architecture decisions at a glance

| Concern | Decision | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript (strict)** | SSR for SEO marketing pages, RSC for fast public pages, islands of client interactivity |
| Styling | Tailwind CSS + design tokens (CSS variables) | Fast, consistent, tiny runtime |
| Backend | **Firebase**: Auth, Firestore, Storage (Phase 12+ docs), Analytics (optional) | Serverless, rules-enforced security, no custom backend in V1 |
| Data validation | **Zod** schemas shared between UI, services, and (later) server | Never trust the client |
| Client data layer | **SWR** (server-state cache, autosave mutation, retry) | Small, handles optimistic autosave |
| Forms | react-hook-form + Zod (complex), controlled inputs (autosave editor) | Accessible errors, dirty tracking |
| Dates/times | ISO-8601 UTC storage + `date-fns`/`Intl`, per-user timezone/format from profile | Avoids 03/04/2026 ambiguity |
| PDF | **Browser print pipeline**: one shared template renderer feeds BOTH live preview and export print route (`window.print()` with paged CSS) | Preview === export (single source of truth, selectable text, no server cost, no puppeteer) |
| Matching / analysis | **Deterministic pure TS engine** (no AI in V1); AI later behind the same interface | Testable, honest, transparent explanations |
| Auth | Firebase Auth (email/password + **Google**). Client SDK + route guards; **Firestore Security Rules are the enforcement backstop** | Data is protected by rules; client guards are UX only |
| Hosting | **Firebase Hosting, static export** (`output: 'export'`) for V1 | Max SEO/perf, zero server ops; Firebase App Hosting is the upgrade path if SSR is ever needed |
| Server code | Zero custom server in V1 except **one Callable Cloud Function** (account deletion & storage cleanup) | Trusted ops must not run from the client |
| Monetization | Config-driven entitlements + `plan` field; Stripe behind a `PaymentService` interface, **not built in V1** | Don't build billing before product validation |
| SEO | File-based content hub + typed per-route metadata + sitemap/robots/JSON-LD | No thin pages, no fake claims |
| Testing | Vitest + RTL + Firebase emulator rules tests; Playwright smoke in Phase 16 | Behavior over "it renders" |

---

### A1. Recommended architecture

```
                    ┌────────────────────────── JOBREADY (Next.js 15, App Router) ──────────────────────────┐
                    │                                                                                         │
                    │   Route groups:  (marketing)   (auth)   (app)   (tools)   (resources)                  │
                    │                                                                                         │
                    │   ┌─────────────── PUBLIC (RSC-first, tiny JS) ───────────────┐                        │
                    │   │ Home · Tools · Landing pages · SEO hub · Pricing · Legal  │                        │
                    │   └──────────────────────────────┬────────────────────────────┘                        │
                    │                                  │                                                      │
                    │   ┌──────────────── AUTH (client Firebase Auth + guards) ────────────────┐              │
                    │   │ Sign in / Sign up / Recover — guest mode always allowed           │                │
                    │   └──────────────────────────────┬────────────────────────────────────┘                │
                    │                                  │                                                      │
                    │   ┌──────────────────────── ACCOUNT AREA (protected) ─────────────────┐                 │
                    │   │ Dashboard · Resumes · Applications · Cover letters · Interview    │                 │
                    │   │ Prep · Documents · Settings                                        │                │
                    │   └──────────────────────────────┬────────────────────────────────────┘                │
                    │                                  │                                                      │
                    │   ┌─────── DOMAIN SERVICES (pure, framework-free, unit-tested) ───────┐                 │
                    │   │ resumeService · applicationService · jobAnalyzer · matchingEngine │                 │
                    │   │ coverLetterService · checklistService · interviewService          │                 │
                    │   │ notificationService · documentService · exportService            │                 │
                    │   └──────────────────────────────┬────────────────────────────────────┘                │
                    │                                  │                                                      │
                    │   ┌────────── RENDERING PIPELINE (resumes & cover letters) ───────────┐                 │
                    │   │ Resume Data → Template Renderer → Print Layout → PDF (print)      │                 │
                    │   └──────────────────────────────┬────────────────────────────────────┘                │
                    └──────────────────────────────────┼─────────────────────────────────────────────────────┘
                                                       ▼
                    Firebase Auth · Firestore (rules) · Storage (rules) · 1 Callable FN · Analytics (opt.)
```

**Layering rule (enforced in review):** UI components never import Firestore directly. They call feature services/hooks. Domain services never import React. This is what lets the matching engine or PDF backend be swapped later without touching screens.

**Proposed folder layout (feature-oriented):**

```
src/
  app/                     # Next.js routes (see A2 route map)
    (marketing)/  (auth)/  (app)/  (tools)/  (resources)/
  components/              # shared UI primitives (Button, Card, Modal, Toast…)
  features/                # feature modules, each self-contained:
    resume/  application/  coverLetter/  interview/  dashboard/
    matching/  analyzer/  checklist/  documents/  settings/  auth/
    # each feature: components/, hooks/, services/, schemas.ts, types.ts, api.ts
  lib/                     # framework glue: firebase, swr, forms, errors, dates, logging
  services/                # cross-feature pure domain services (matcher, analyzer, export)
  hooks/                   # generic hooks (useAutosave, usePageGuard, useMedia)
  types/                   # shared domain types
  config/                  # features.ts (flags), templates.ts, questions.ts, plans.ts, seo.ts, ads.ts
  content/                 # SEO hub articles (Markdown/MDX, typed frontmatter)
  styles/
  tests/                   # unit + integration + rules tests
public/                    # static assets, robots.txt (generated), favicon, og images
```

`app/` holds thin route shells + metadata; real logic lives in `features/` and `services/`.

---

### A2. Complete route map

**Route groups:** `(marketing)` public SEO pages · `(auth)` guest auth pages · `(app)` protected workspace · `(tools)` public utilities · `(resources)` SEO content hub.

| Route | Group | Auth | Purpose |
|---|---|---|---|
| `/` | marketing | public | Homepage (hero, workflow, tools, how it works, privacy, FAQ) |
| `/tools` | tools | public | Tool hub |
| `/tools/resume-builder` | tools | public | Guest CV builder (localStorage draft) |
| `/tools/cover-letter` | tools | public | Guest cover letter builder |
| `/tools/job-analyzer` | tools | public | Job description analyzer |
| `/tools/resume-checker` | tools | public | Deterministic resume quality checker |
| `/tools/keyword-checker` | tools | public | Keyword/requirements vs pasted text |
| `/tools/checklist` | tools | public | Job application checklist generator |
| `/tools/interview-questions` | tools | public | Interview question library (curated) |
| `/tools/star-method` | tools | public | STAR builder (guest) |
| `/resume-builder` | marketing | public | Main product landing page → app CV builder |
| `/cv-builder`, `/cover-letter-builder`, `/resume-templates`, `/resume-for-{audience}`, `/cover-letter-for-{role}` | marketing | public | SEO landing pages w/ real content (see A12) |
| `/resources`, `/resources/{slug}` | resources | public | SEO content hub (typed content) |
| `/pricing` | marketing | public | Pricing |
| `/about`, `/faq`, `/contact` | marketing | public | Info pages |
| `/privacy`, `/terms` | marketing | public | Legal |
| `/auth/signin`, `/auth/signup`, `/auth/recover` | auth | guest-only | Auth |
| `/dashboard` | app | protected | Career workspace home |
| `/resumes` | app | protected | CV library (list, duplicate, delete) |
| `/resumes/new` | app | protected | Create CV (choose template) |
| `/resumes/[id]` | app | protected | CV editor (3-col desktop / stepper mobile) |
| `/resumes/[id]/preview` | app | protected | Full-page preview (zoom, page nav) |
| `/resumes/[id]/export` | app | protected | **Print/PDF route** (paged CSS, `window.print()`) |
| `/applications` | app | protected | Tracker: search, filter, sort, stats |
| `/applications/new` | app | protected | Create application workspace |
| `/applications/[id]` | app | protected | **Workspace** with tabs: overview · requirements · cv · cover-letter · documents · checklist · interview · notes · timeline |
| `/applications/[id]/export-cover-letter` | app | protected | Print route for cover letter PDF |
| `/interview-prep` | app | protected | Question library + STAR answers + prep checklists |
| `/settings` | app | protected | Profile / preferences / notifications / account |
| `sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx` | — | public | SEO/PWA primitives |

`/dashboard`, `/applications/*`, `/resumes/*`, `/interview-prep`, `/settings` are protected by client route guards (auth-gate screen) — with **Firestore rules as the real security gate**.

---

### A3. Firestore data model

**Design principles:** no over-normalization; collections optimized for the reads a single user makes (list resumes, list applications, open one workspace); user-scale data (tens–hundreds of docs) means in-memory joins after a list query are fine. Everything private carries `userId` and rules enforce ownership on **every** path.

```
users/{uid}
  name, email, professionalTitle, experienceLevel, careerField,
  country, locale, timezone, dateFormat, currency,
  plan: "free" | "pro",
  notificationPrefs { webPush, email, deadlineAlertsDays },
  onboarded { profile, firstCv, firstApplication },
  timestamps

resumes/{resumeId}
  userId, name, templateId, pageSize: "A4" | "LETTER",
  data: ResumeData          (A8 — full structured CV; single authoritative field)
  timestamps

applications/{applicationId}
  userId,
  job: { title, company, url?, location, employmentType, salary?,
         description, deadline? },
  status, favorite,
  dates: { createdAt, updatedAt, appliedAt?, withdrawnAt? },
  method?: "online" | "email" | "inperson" | "other",
  requirements?: ExtractedJobRequirement[]   (A10 — written once by analyzer)
  checklist: ChecklistItem[]                  (embedded — bounded, computed client-side)
  readiness: { cvId?, coverLetterId?, docsRequired, docsDone }  (references + counts only)
  interviews: Interview[]                     (embedded array — small, updated per app)
  notes: Note[]                               (embedded, capped ~50 notes)

applications/{applicationId}/events/{eventId}   (SUBSCRIPTION — timeline grows unbounded)
  type: "created"|"analyzed"|"tailored"|"submitted"|"status_changed"|
        "interview_scheduled"|"interview_completed"|"note"|"custom",
  label, at, meta?

documents/{documentId}                        (Phase 12+ — uploaded files)
  userId, applicationId?, kind: "portfolio"|"certificate"|"reference"|"other",
  name, mimeType, sizeBytes, storagePath, timestamps

savedAnswers/{answerId}                       (interview prep, reusable STAR answers)
  userId, question, situation, task, action, result, tags, timestamps

meta/{key}                                    (small public config: question bank version, etc.)
```

**Deliberate choices:**
- **Checklist, requirements, interviews, notes are embedded** in the application doc — one read loads the whole workspace; single-user writes mean array-update contention is a non-issue at V1 scale. Derived completion is computed client-side (never stored — §85).
- **Timeline is a subcollection** because events grow without bound and are append-only.
- **Resume data is one blob** (`data`) — the doc is the unit of save for autosave; template/pageSize stay at top level for cheap list rendering.
- **No duplicated derived stats anywhere** (no `completionPercentage`, no cached match scores). Dashboard stats are computed from `applications` queries.
- **Deleted CV attached to an application:** application keeps job data; `readiness.cvId` is cleared to null; checklist's "CV" item flips to undone with a human hint ("Attach a CV"). Deleting an application deletes its events subcollection (via callable/batch) — documents referencing it are detached, not deleted, unless owned solely by it.
- **Indexes:** `applications` by `(userId, dates.createdAt desc)`, `(userId, status)`, `(userId, dates.deadline)`, `resumes` by `(userId, updatedAt desc)` — plus any filters introduced later (documented composite indexes in `firestore.indexes.json`).

### A4. Firebase Storage model (Phase 12+)

```
users/{userId}/documents/{autoId}
```
- **No public URLs ever**; downloads only via authenticated `getDownloadURL()` after rules allow the requester.
- **Rules** verify `request.auth.uid == userId` (from path), enforce allow-list of MIME types (pdf, png, jpg, webp, docx), and reject files > 10 MB via `request.resource.size`. Extension alone is never trusted — MIME sniffing on read/validation side too.
- Upload path: client validates (type + size) → `uploadBytesResumable` → metadata write to `documents/{id}`. Deletion removes metadata **and** storage object together (callable or client delete with matching rules).
- Orphan prevention: metadata write happens only after successful upload; deletion is transactional (delete object then doc, with retry).

### A5. Authentication architecture

- **Hosting model (confirmed): Firebase Hosting, static export.** There is no Node server, so V1 has **no session-cookie middleware and no SSR of protected pages**. All app data is fetched client-side from Firestore — which is exactly what makes client guarding + rules safe and simple.
- **Providers (V1):** email/password **+ Google OAuth** (confirmed). Password recovery via `sendPasswordResetEmail`.
- **Guest-first:** no auth required to use public tools. The CV builder runs fully in guest mode with a **localStorage draft**; an unobtrusive banner offers "Save to your account" → sign up → draft is migrated into Firestore (`resumes/`). Nothing is lost.
- **Client:** `features/auth/AuthProvider` wraps the app; `useAuth()` gives `{ user, status: 'loading'|'guest'|'authed' }`. `loading` renders a real skeleton — never a flash of the wrong UI.
- **Route protection:** protected routes render behind an auth-gate screen that shows "Sign in to continue" for guests (no redirect loops, no flash of data). **Firestore Security Rules are the actual enforcement** — every doc requires `request.auth.uid == owner`, so even a bypassed guard exposes nothing.
- **Upgrade path:** if SSR is ever needed (server-rendered dashboard, per-user OG images, server actions), move the same Next.js app to **Firebase App Hosting** (Node runtime) — middleware/Admin-SDK session cookies become available without changing the data architecture.
- **Account deletion:** the UI never deletes user docs directly (client recursive deletes are insecure/slow). A **Callable Cloud Function** `deleteAccount` runs server-side: verifies the caller, deletes `resumes`, `applications` + their `/events`, `documents` metadata + Storage objects, `savedAnswers`, then the Auth user. Cleanup with retry; returns success to client.
- **Session expiry:** Firebase handles token refresh; SWR `mutate` re-runs on auth state change so the UI never acts on stale auth.
- **Account deletion:** UI never deletes user docs directly (client recursive deletes are insecure/slow). A **Callable Cloud Function** `deleteAccount` runs server-side: verifies the caller, deletes `resumes`, `applications` + their `/events`, `documents` metadata + Storage objects, `savedAnswers`, then the Auth user. Single atomic-ish cleanup with retry; returns success to client.
- **Session expiry:** Firebase handles token refresh; middleware + SWR `mutate` re-run on `onIdle`/`onAuthStateChanged` to avoid acting on stale auth.

### A6. Component architecture

Two layers, no leak between them:

1. **`components/ui`** — dumb primitives: `Button`, `Input`, `Textarea`, `Select`, `Field` (label+error wrapper), `Checkbox`, `RadioGroup`, `Modal`, `ConfirmDialog`, `Toast`/`Toaster`, `Card`, `Badge`, `Tabs`, `ProgressBar`, `FileUploader`, `DatePicker`, `EmptyState`, `LoadingState` (skeleton), `ErrorState`, `Tooltip`, `DropdownMenu`, `IconButton`, `AdSlot`. Each is accessible by default (label association, focus trap in Modal, `aria-live` for toasts).
2. **`features/*`** — composed screens/business components.

**State strategy (deliberately boring):**
- Server state (Firestore docs) → SWR keys per entity (`/resumes`, `/applications/[id]`).
- Autosave editor → local controlled state + debounced mutate; SWR gives retry + reconciliation.
- No global store. Modal state, wizard step, form state stay local. If cross-cutting UI state ever grows, add a single small Zustand store — **not before then**.

### A7. Feature architecture (services)

Each service is a plain module with a typed API; UI calls hooks that wrap them.

```
resumeService      list, get, create, update(data), duplicate, delete, guestDraft(localStorage)
applicationService list(+search/filter/sort), get, create, updateStatus, delete, setApplied,
                   addNote, addEvent, toggleFavorite, attachCv
jobAnalyzer        analyzeJobDescription(text) → ExtractedJobDescription     (pure)
matchingEngine     matchResumeToRequirements(resumeData, requirements) → MatchReport  (pure)
coverLetterService build from application + optional resume fields; templates; export
checklistService   defaultChecklistFor(job) · toggle · addCustom · completion(recompute)
interviewService   questionBanks, prepChecklist, starAnswers CRUD, attachInterview(appId)
notificationService deriveUpcoming(apps) → in-app reminders; web-notification wrapper
exportService      layoutFor(resumeData, template, pageSize) → print DOM; pageCount check
documentService    validate/upload/metadata/delete (Phase 12+)
analyticsService   track(event, props?) — no PII, no doc contents (see A17)
errorService       map codes → human copy (see A16)
```

All I/O goes through `features/*/api.ts` (Firestore reads/writes) so services stay pure where possible and everything is mockable.

### A8. CV (Resume) data model

Data and template are separate. One structured object, rendered by any template.

```ts
type ResumeData = {
  personal: {
    fullName: string; professionalTitle?: string;
    email: string; phone?: string; location?: string;
    website?: string; linkedin?: string; github?: string; // urls validated
    summary?: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: string[];                       // normalized tags
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  awards: Award[];
  volunteer: Volunteer[];
  customSections: CustomSection[];        // user-added: name + entries
  preferences: {
    includedSections: SectionKey[];       // order + visibility (hide/show/reorder)
    showReferences?: boolean;
  };
};

type WorkExperience = {
  id: string; role: string; company: string;
  location?: string; start?: MonthYear; end?: MonthYear | "present";
  current?: boolean; bullets: string[]; highlights?: string[];
};
type MonthYear = { month: number; year: number };  // stored as numbers → format per locale
// Education / Project / Certification / Language / Award / Volunteer mirror this shape
// with id + typed fields + optional date ranges.
```

**Rules:** every list item has `id` (stable for React keys + array diffs); dates are structured numbers (never ambiguous strings); Zod schema validates the whole object before save/export (email, URLs, max lengths per field, caps on list lengths to bound doc size).

### A9. Application data model

See A3 for the stored doc. The domain shape used by the UI:

```ts
type ApplicationStatus =
  | "draft" | "preparing" | "ready" | "applied"
  | "interview" | "second_interview" | "offer" | "accepted"
  | "rejected" | "withdrawn";

type Application = {
  id: string;
  job: JobDetails;
  status: ApplicationStatus;
  favorite: boolean;
  dates: { createdAt: number; appliedAt?: number; deadline?: number };
  requirements?: ExtractedJobRequirement[];   // set after “Analyze this job”
  checklist: ChecklistItem[];                 // computed completion client-side
  interviews: Interview[];                    // date,type,link,interviewer,notes,status,result
  notes: Note[];
  readiness: { cvId?: string; coverLetterId?: string };
};
```

Status transitions are **user-driven** with one smart shortcut (§58): marking **Applied** opens a small modal (date applied, method, optional follow-up date) that writes `dates.appliedAt`, appends an `events` row, and flips the checklist "Application submitted" item to done. Marking **Interview** suggests attaching interview details next.

### A10. Job analyzer (deterministic)

`analyzeJobDescription(text)` — pure, no network, no AI:

1. Normalize text (whitespace, casing, dedupe).
2. **Skill lexicon pass:** match against `config/skills.ts` — a curated, categorized lexicon (frontend/backend/data/cloud/tools/languages/soft-skills) with aliases (`"react.js"`, `"ReactJS"` → `react`). Unknown but token-like terms fall into `keywords`.
3. **Pattern passes:** experience (`(\d+)\+?\s*(?:years?|yrs)`, seniority words), education (degree lexicon), certifications, responsibilities (bullet/`•`/numbered line segmentation), employment type/location heuristics.
4. Output (categorized, deduplicated, each item with source context snippets for explainability):

```ts
type ExtractedJobRequirement = {
  id: string;
  category: "skill" | "technology" | "qualification" | "education"
         | "experience" | "responsibility" | "certification" | "language"
         | "soft_skill" | "keyword";
  label: string;            // canonical label
  normalized?: string;      // for matching
  evidence: string[];       // short source phrases
  importance: "must" | "nice" | "unknown"; // from “must-have/required” phrasing
};
```

The same analyzer powers the public `/tools/job-analyzer` (stateless, client-side) and the in-application “Analyze this job” action (result stored on the application). **No server cost, no rate limiting needed.**

### A11. Matching engine architecture

Independent, pure, UI-free. Interface is stable so a future AI layer can implement the same contract.

```ts
interface MatchingEngine {
  match(input: {
    resume: ResumeData;
    requirements: ExtractedJobRequirement[];
  }): MatchReport;
}

type MatchReport = {
  summary: { matched: number; partial: number; unmatched: number; total: number };
  results: MatchResult[];   // one per requirement
};

type MatchResult = {
  requirement: ExtractedJobRequirement;
  status: "strong" | "partial" | "not_found";
  evidence?: { location: string; snippet: string }[];  // WHERE it was found
};
```

**Matching logic (V1, transparent):**
- Normalized token search across the resume’s **searchable corpus**: skills, experience bullets, project descriptions, education, certifications, languages, summary.
- `strong` = exact/normalized canonical match (e.g. `react` in skills or bullets); `partial` = single mention / fuzzy / alias or stem match only; `not_found` = absent everywhere.
- Evidence records the section and snippet that matched, so every badge is explainable (“React ✓ found in Work experience — 'built dashboards with React'”).
- Experience/education requirements match against the resume’s structured date ranges (e.g. “3+ years” vs computed span) only when data is present; otherwise marked `not_found` with a *“not shown in CV”* message.

**Honesty rules baked in (§22–§23):** copy distinguishes “not found in your CV” from “you may not have this” — never predicts hire probability, never says “82% likely.” UI language: *“Your CV shows 8 of 11 requirements the job lists.”* Missing keyword ≠ missing skill; the gap view explicitly says so.

### A12. SEO architecture

- **Public-first:** marketing + tools + resources are RSC with tiny JS. Dashboard pages are never indexed (`noindex` on `/app` routes).
- **Metadata:** shared `config/seo.ts` + typed `generateMetadata` per route; canonical URLs; Open Graph + Twitter cards; `opengraph-image` generator; per-page `title`/`description` with no keyword stuffing.
- **Primitives:** `sitemap.ts` (only real pages), `robots.ts`, JSON-LD (`WebApplication`, `FAQPage` on FAQ pages, `Article` on content, `BreadcrumbList` on tools) — accurate schema only, no misleading markup.
- **Content hub:** `content/` Markdown files with typed frontmatter (title, description, updatedAt, related tools) → `/resources/{slug}`. Build-time parse; content is real, useful, maintained. Explicit **no thin pages** and **no fabricated stats/testimonials**.
- **Landing pages** (each with genuine substance + working tool link + internal links): a config-driven set for high-value intents — cv/resume builder, cover letter builder, resume templates, and audience pages (`resume-for-student`, `resume-for-graduate`, `resume-for-internship`, `resume-for-software-engineer`…) where each has *real* tailored guidance, not a templated paragraph swap.
- **Internal linking graph** (enforced in templates): article → tool → next tool → application workspace → interview prep, so bots and users flow through the funnel.
- **PWA:** manifest + installability added without hurting SEO (normal web page first; no app-shell redirect tricks). **[OPEN]** — confirm we want the manifest in Phase 14.

### A13. Monetization architecture

- **Entitlements are configuration, not scattered `if`s:** `config/plans.ts` maps `{ free: FeatureSet, pro: FeatureSet }`; `useEntitlement(feature)` reads `user.plan` + config. Feature-flag style keyed checks only.
- **`plan` lives on `users/{uid}.plan`.** Client gating is UX only — premium-gated *content* (advanced templates in Phase 15) is additionally enforced by Firestore rules reading the user doc where applicable. Never trust a client boolean for anything valuable.
- **Payment:** `services/PaymentService` interface defined but **not implemented in V1**; Stripe later (Checkout/Payment Links → webhook → update `plan`). No billing code ships now (§103).
- **Ads:** `components/ui/AdSlot` + `config/ads.ts` placement map; only renders when the ads feature flag is on and a script is configured. Slots live in designated areas only — **never** inside the CV editor, over the download button, inside important forms, or between critical workflow steps. Free product stays fully useful with ads.
- **Dark patterns prohibited** (§66): no forced signup, no hidden download buttons, no fake timers, honest pricing page.

### A14. Security architecture

- **Firestore rules** deny everything by default; allow only owner-scoped reads/writes where `request.auth.uid == resource.data.userId`; validate required fields and types in rules (`request.resource.data.keys().hasAll([...])`); disallow `list` on collections a user shouldn’t enumerate; no public collections.
- **Storage rules** (A4): path ownership + MIME/size allow-list.
- **Callable** `deleteAccount` runs with Admin privileges server-side; user identity verified via context.
- **Validation (Zod)** on the client *and* re-validated in any server/callable path; never trust client validation alone for security-sensitive ops (§45).
- **Headers:** sensible CSP + security headers via `next.config` (`X-Content-Type-Options`, `Referrer-Policy`, frame-ancestors, etc.); all user content rendered as escaped React text (XSS-safe by default) — no `dangerouslySetInnerHTML` anywhere.
- **Uploads (later phase):** type sniffing, size caps, storage rules, no public URLs, deletion of object+metadata (A4/§37).
- **Rate limiting:** V1 analyzers/matchers/PDF are client-side (no server resources). The one callable (account deletion) is naturally rate-limited per user. When AI/server endpoints arrive, they go behind Cloud Functions with per-user quotas (design reserved, not built).
- **Analytics:** no resume/cover-letter/note/document content ever sent (A17).
- **Logging:** structured, no private content; error IDs instead of content (§104).

### A15. Notification architecture

- **Source of truth = the data.** Reminders are *derived* from `applications` (deadlines, follow-up dates, interview datetimes), not stored as a separate reminders table.
- **In-app (always available):** the dashboard “Upcoming” panel lists application deadlines, interview times, and follow-ups due within a configurable window (`notificationPrefs.deadlineAlertsDays`). This is the mandatory fallback — never assume Web Notifications exist (§30).
- **Web Notifications (progressive enhancement):** on toggle in settings, request permission; schedule/browse-time notifications via the Notifications API when the app is open. Stored preference in `users/{uid}.notificationPrefs`.
- **Email/server reminders:** Phase 14+ only (Cloud Functions scheduled jobs + optional FCM/email), behind `NotificationService` so V1 UI doesn’t change. No marketing email without consent (§109).
- Users can disable everything; we never spam.

### A16. Error-handling strategy

- **Typed errors:** `lib/errors.ts` defines a small set — `NetworkError`, `PermissionError`, `ValidationError`, `NotFoundError`, `StorageError`, `ExportError`, `UnknownError` — mapped from Firestore/`fetch` codes to **human copy** (e.g. `permission-denied` → “We couldn’t open that. If it’s yours, try signing in again.”). Raw codes never reach the UI.
- **Layers:** `error.tsx` (route-level, full-screen friendly error + retry), `global-error.tsx`, client `ErrorBoundary` per feature, `Suspense` skeletons in `loading.tsx`. Every async op shows an explicit state: loading → success | error-with-retry.
- **Autosave failures never lose content:** edits live in local state; on failure a “Save failed — retrying” toast keeps the draft; content is also mirrored to localStorage (draft recovery) and re-synced on reconnect. Never overwrite newer server data with older local data (compare `updatedAt`; on conflict show a gentle “Which version?” choice — rare at single-user scale).
- **Before-leave guard** for editors with unsaved changes (`beforeunload` + router guard).
- **PDF/download failure** handled by `exportService` with explicit message + retry.
- **Observability:** client error logging with error IDs + anonymized metadata (no content). Phase 16 adds a small set of error events to analytics.

### A17. Analytics architecture

- Firebase Analytics (optional; gated by `NEXT_PUBLIC_ENABLE_ANALYTICS`).
- **Events only** (see §67 list): `landing_page_view`, `tool_opened`, `resume_created`, `resume_saved`, `resume_exported`, `application_created`, `job_description_analyzed`, `cover_letter_created`, `application_marked_applied`, `interview_created`, `premium_viewed`, plus funnel probes (tool → CV → application → applied).
- **Hard rule:** no resume text, cover letter text, notes, or document content in any event or property. Content hash only if ever needed for abuse detection.
- Consent-aware init (analytics disabled until explicit/legal-appropriate consent where required).

---

### A18. PDF generation architecture

```
ResumeData ──► TemplateRenderer (React, same component as live preview)
                 └─ template: minimal | modern | professional | academic | entry-level
                        └─ CSS paged media (@page size A4/Letter, margins, page-break rules)
                               └─ /resumes/[id]/export  (print layout route, full viewport)
                                      └─ window.print()  ─►  browser PDF (selectable text)
                                             └─ pageCount check ─► warnings (A18b)
```

**Why browser print for V1:** preview and export share the *exact same DOM and CSS*, so preview === PDF by construction (no react-pdf template duplication drift, no puppeteer server, selectable text, correct fonts, zero server cost, works offline). `exportService` owns layout details so a future switch to a server renderer (`@react-pdf`/puppeteer/API) swaps one module, not the app.

**A18a. Print layout rules:**
- Fixed page geometry via `@page { size: A4 | Letter; margin: 14–16mm }`; content sized in mm/pt so it matches the on-screen A4/Letter preview.
- Page-break hygiene: `break-inside: avoid` on entries (each experience/education item stays intact), `break-before` control for sections that must start on a new page (rare), `widows/orphans` handling.
- Fonts: self-hosted (next/font) — same fonts render in browser and PDF; no network fonts during print.
- Date/currency formatting per user locale at render time.

**A18b. Page-count handling (§18):** after render, a measurement pass computes page breaks (each “page” is an element of exact page height; count elements that overflow). Warnings surfaced non-destructively in the editor:
- 2 pages: neutral info.
- 3+: “Your CV is now N pages.” → offer controls: tighten spacing (template spacing scale), reduce base font within safe limits (≥10pt), switch template, or edit content. Never auto-truncate content.

**A18c. Export flow:** PDF = File → Save as PDF (or browser print dialog, Safari/Edge/Firefox). DOCX export is Phase 15+ behind `ExportService`. Cover letters use the same pipeline.

### A19. Testing strategy

| Layer | Tool | What it covers |
|---|---|---|
| Unit (pure logic) | Vitest | Job analyzer extraction; matching engine (strong/partial/not_found + evidence + normalization + aliases + empty CV); Zod schemas; date utilities (deadline math, timezone-safe rendering); resume data transforms; checklist completion; default checklists; status transitions |
| Component | Vitest + RTL | Editor sections (add/remove/reorder/hide), autosave indicator, checklist toggles, wizard, empty/loading/error states, modal a11y, form validation errors |
| Rules | Firebase Emulator suite | Firestore rules: unauthenticated denied; cross-user denied; owner allowed; shape validation; Storage rules (MIME/size/ownership); account-deletion callable cleanup |
| E2E smoke (Phase 16) | Playwright | Signup → create CV → export PDF → create application → analyze → match → cover letter → checklist → applied → interview prep; mobile viewport pass |
| A11y | axe + manual checklist | Keyboard-only flow, focus order, labels, contrast, reduced-motion, touch targets (Phase 16) |

Test data factory (`tests/fixtures`) with: empty CV, student CV, career-changer CV, very long CV (4 pages), unicode/special chars, long titles/URLs, missing dates. **Features aren’t “done” until their behavior tests pass (§86).**

---

### A20. Development roadmap (mapped from §119)

Each phase ends with a working, tested slice (dev method §120: explain → build → run → test → fix → edge cases → responsive → a11y → security → next).

| Phase | Scope | Exit criteria |
|---|---|---|
| **0** | This plan + design tokens/spec below | Plan approved; open questions answered |
| **1** | Project scaffold: Next.js+TS strict, Tailwind tokens, ESLint/Prettier, folder layout, Firebase init + emulator, CI test runner | `npm run dev`, `lint`, `test` all green; design tokens in place |
| **2** | Public site: homepage, nav, footer, tools hub, about/privacy/terms/contact/FAQ, design system primitives | Public pages pass a11y + responsive pass; pageweight budget ok |
| **3** | Auth: signup/signin/recover/guest, middleware + cookie, AuthProvider, account deletion callable | Rules tests pass; guest→account CV migration path demoed |
| **4** | Profile + preferences (name, country, tz, date format, notif prefs) | Settings write + rules verified |
| **5** | CV engine: ResumeData, CRUD, duplicate, editor (sections add/remove/reorder/hide), autosave, templates, live preview, mobile stepper | Editor unit/component tests; autosave recovery test |
| **6** | PDF export: print route, paged CSS, pageCount + warnings, page-size switch | Export matches preview; long-CV warning verified |
| **7** | Application workspace: create, job details, status flow (+applied modal), notes, timeline, search/filter/sort, stats | Workspace CRUD tests; status transition tests |
| **8** | Job analyzer (in-app + public tool) | Extraction tests (skills/experience/education/responsibilities) |
| **9** | Matching engine + CV tab UX (strong/partial/missing + evidence, skill gap view) | Matcher tests incl. honesty copy; gap view verified |
| **10** | Cover letter builder (scratch/template/improve), association to application, PDF export | Cover letter CRUD + export tests |
| **11** | Checklist (default per job, custom items, readiness %), application readiness view | Checklist tests |
| **12** | Interview: records on application, question library, STAR builder, saved answers, prep checklist | Interview tests; STAR builder tests |
| **13** | Dashboard: overview cards, upcoming panel, quick actions, recent applications, activity/statistics | Dashboard queries + empty/loading states tested |
| **14** | SEO: metadata everywhere, landing pages, resources hub (real content), sitemap/robots/JSON-LD, internal links, PWA manifest (if approved) | Lighthouse SEO/perf pass; noindex on app; canonical audit |
| **15** | Monetization-ready: pricing page, plans config + entitlement hook, ad-slot scaffolding, feature flags; no billing code | Gating architecture tested; pricing page |
| **16** | Hardening: Playwright smoke, a11y + responsive audits, security rules review, PDF edge cases, error/loading polish | Full test suite green; audit checklist signed off |

---

### A21. MVP boundary (explicit)

**In V1:** everything listed in §5 + §115, plus guest-first tools, deterministic analyzer/matcher, print-based PDF, rules-secured Firestore, honest SEO hub, config-driven monetization shells.

**Explicitly NOT in V1 (§123):** AI features (any), social/community, job board, job-URL scraping, DOCX export, payments/Stripe, email/server reminders, FCM push, native apps, developer API, admin console, CMS, browser extension, calendar/LinkedIn integrations, voice/video interview simulators, dark mode (deferred; token-ready). Each has a reserved seam (interface/config) so it can be added without rework.

### A22. Risks & recommendations

1. **No SSR on Firebase Hosting static export** — protected pages are client-guarded. *Mitigation:* Firestore rules are the real gate (guards are UX only, never trust them for security); Firebase App Hosting is the documented upgrade path if SSR is ever required.
2. **Browser PDF variance** (fonts/pagination differ slightly across browsers) — *Mitigation:* shared DOM+CSS keeps variance minimal; self-hosted fonts; document supported browsers; validate on Chrome/Edge/Safari/Firefox in Phase 16.
3. **Scope creep** — the spec is huge. *Mitigation:* MVP boundary above is a contract; each phase ships independently; tools/marketing content built from templates + fixtures, not bespoke.
4. **Firestore costs/queries** — *Mitigation:* single-doc workspace reads, embedded arrays, computed stats client-side, indexes defined up front.
5. **Rules mistakes = data exposure.** *Mitigation:* deny-by-default + emulator rules tests in Phase 3 and every phase that adds a collection.
6. **SEO thin content temptation.** *Mitigation:* config-driven landing pages each require substantive copy review; content hub is human-quality, small.
7. **Timezone/date bugs** — structured date storage + explicit per-user formatting utilities + tests (A8/§72).
8. **Guest-draft data loss** — localStorage mirror + migration path (A5).
9. **AI honesty expectations** — product copy and matcher UI must stay transparent; no fabricated predictions/metrics (§22, §61).
10. **Empty/CMS-free content editing** — marketing copy lives in config/content files for V1; acceptable.

**Decisions confirmed (2026-09-04):**
- Deployment: **Firebase Hosting, static export** for V1 (Firebase App Hosting as the future SSR upgrade path).
- Auth: email/password **+ Google** OAuth from day one.
- Visual direction: **deep indigo + calm neutrals**, light theme first.
- Project location: scaffold **directly in this workspace root** (`c:\Users\eng okumu\Desktop\website 4`).
- Analytics: **Firebase Analytics, event-only, no content**, enabled via env flag with consent-aware init.

---

## PART B — UI/UX SPECIFICATION

### B0. Design system (tokens)

**Principles (§78):** professional, modern, clean, trustworthy, calm, career-focused. Feels like “getting organized,” not “using a SaaS.” No excessive gradients, no cheap template look, minimal motion (respect `prefers-reduced-motion`).

- **Type:** `Inter` (UI) + a restrained serif (`Lora`/`Source Serif`) reserved for resume templates that call for it. Scale: `12/14/16/18/20/24/30/38/48`; UI copy 14–16px.
- **Color tokens (light-first):** primary `indigo-700`-family (#4338CA family) for actions/links; neutral slate/stone for text/surfaces; semantic: `success #16a34a`, `warning #d97706`, `danger #dc2626`; background `#ffffff/#f8fafc`; text `#0f172a/#475569`; borders `#e2e8f0`. All contrast ≥ 4.5:1.
- **Radius:** 6/8/12; **Shadow:** soft, low; **Spacing:** 4px scale.
- **Motion:** ≤200ms, fade/slide only, no bouncy easings.
- **Icons:** single set (e.g. Lucide), stroke style.
- **Status colors** for applications: draft=neutral, preparing=indigo, ready=teal, applied=blue, interview=amber, offer=green, rejected/withdrawn=red/gray.

**Shared component behaviors:** every async button shows busy state; every destructive action uses `ConfirmDialog` with plain-language copy; toasts auto-dismiss except errors (persist + retry); all forms: visible label, required marker, inline error below field, success/“Saved” confirmation for autosave.

---

### B1. Homepage

**Layout (top → bottom), all server-rendered, zero login required:**

1. **Top bar:** Logo “JOBREADY” · Tools · Resources · Pricing · Sign in · **[Create your CV]** (primary).
2. **Hero:** eyebrow “Your job application, organized.” H1 **“Get your job application ready.”** Supporting copy: “Create your CV, tailor your application, organize your documents, track applications, and prepare for interviews — all in one place.” CTAs: **[Start My Application]** (primary) · **[Create a CV]** (secondary). Below: a clean illustrative mock of the workspace (not a screenshot carousel).
3. **The workflow (5 steps):** Build your CV → Match it to the job → Prepare your application → Track your application → Prepare for the interview. Rendered as numbered cards with internal links.
4. **“What do you need?”** — six cards: Create a CV · Tailor my CV · Write a cover letter · Prepare a job application · Track applications · Prepare for an interview. Each links to the matching tool/app page.
5. **Popular tools:** compact grid (resume builder, job analyzer, checklist, interview questions, resume checker, STAR builder).
6. **How JOBREADY works:** 3 steps — paste the job → build & match your CV → track to the offer. (Product loop §92 visual.)
7. **Privacy/security strip:** “Your data stays yours.” short bullets (private by default, no public resumes, export & delete anytime).
8. **FAQ** (accordion, JSON-LD `FAQPage`): ~6 honest answers.
9. **Footer:** product/tools/resources/legal columns + language/region note.

Empty/loading/error states: N/A (static page). A11y: skip-link, semantic landmarks, keyboard nav on cards.

---

### B2. Dashboard (protected, `/dashboard`)

**Header:** time-aware greeting — “Good morning, John” (name from profile; fallback “Welcome back”) + quick **New application** button.
**Layout (desktop):** 3-column responsive grid; mobile single column.

1. **Status cards row:** Active applications · Interviews · Offers (computed from data; each links to filtered list). Also a “This week” mini-strip: applications sent, CVs tailored, interviews, follow-ups (§36 — activity, not success claims).
2. **Upcoming panel:** next items by date with type badges (Interview — “Tomorrow, 10:00 AM”; Application deadline — “Friday”). Empty: “Nothing upcoming. Add an application deadline or interview to see reminders here.” Sourced from applications (A15).
3. **Quick actions:** [Create CV] [New Application] [Cover Letter] [Interview Prep] — icons + labels.
4. **Recent applications** (table/cards): title+company, status badge, deadline, updated; row → workspace. Empty state: “You don’t have any applications yet.” → [Create your first application].
5. **Application progress mini-list** (optional): readiness bars for most-active applications.

Loading = skeleton cards; error = ErrorState with retry. Useful even with a single application (empty states everywhere else).

---

### B3. CV builder (editor, `/resumes/[id]`)

**Desktop — three columns:**
- **Left rail (section nav):** list of sections (Personal, Summary, Experience, Education, Skills, Projects, Certifications, Languages, Awards, Volunteer, Custom) with visibility toggles + drag-reorder handles; “+ Add section” (custom). Also: Template picker + page size (A4/Letter) + page-count warning chip.
- **Center (editor):** focused editing for the selected section — fields, repeatable entries (experience/education/projects…) with add/remove/reorder of entries and bullets. Autosave status top-right: **Saving… / Saved / Save failed (Retry)**. Content never lost on failure (A16).
- **Right (live preview):** rendered template, scaled, page-accurate; page-count badge (“3 pages” amber when >2). Toolbar: template/zoom/print/export PDF.

**Mobile — stepper:** segmented top bar (Sections | Edit | Preview). Edit screen shows one section at a time with next/prev; Preview is full-page accurate with zoom; Export via “Download PDF.” Not a shrunken 3-col interface (§48).

**Interactions:** add/remove/reorder/hide section (A8 preferences); duplicate CV from the library screen; template switch preserves all data (only rendering changes); page warnings (A18b) non-destructive with offered fixes.

---

### B4. CV preview

- **Library card click** → full-page preview route: paper rendered at exact A4/Letter, real fonts, margins, page breaks.
- **Tools:** zoom (fit/50/75/100), page prev/next (multi-page), page-size toggle (with warning that content flow may change), **[Download PDF]** prominent, **[Edit]**.
- Preview must equal export by construction (shared renderer). If page count changed vs editor, reflect it live.
- Cover letters share this preview/print pattern.

---

### B5. Application workspace (`/applications/[id]`)

**Header:** “SOFTWARE ENGINEER — Acme Inc.” · status dropdown (chips) · favorite star · deadline chip · **primary CTA** switches by status (“Continue application” / “Mark as applied” / “Prepare for interview”).
**Tab bar:** Overview · Requirements · CV · Cover letter · Documents · Checklist · Interview · Notes · Timeline (fit on desktop; horizontal scroll/segmented on mobile).

- **Overview:** job facts (title, company, location, type, salary, URL, deadline, dates) + readiness card (CV ✓, Cover letter ✓, Documents 3/4, Checklist 80%) + Continue CTA + quick actions (Analyze job, Add interview, Add note).
- **Requirements:** after “Analyze this job,” grouped extracted requirements (A10) with must/nice badges; re-analyze allowed; shows categories + evidence.
- **CV:** choose CV version to attach (or create one), view match summary inline, link to full editor; shows which CV is attached.
- **Cover letter:** opens the cover letter builder scoped to this application.
- **Documents:** per-application doc list (Phase 12 storage); V1 lists required doc checklist + placeholders + upload targets.
- **Checklist / Interview / Notes / Timeline:** see B8–B10.

Empty tab states guide the next action (“No CV attached → [Add a CV]” etc.). Every async action has a loading + error/retry state.

---

### B6. Job analyzer (`/tools/job-analyzer` + in-app)

**Single-purpose page:** big textarea “Paste the job description” → **[Analyze this job]** (busy: “Analyzing job…”). Result card groups: **Technical skills · Experience · Education · Responsibilities · Certifications · Languages · Other keywords**, each item with badge `must/nice/unknown` and an expandable “Why?” showing source phrase (evidence). Actions: [Copy summary] and (if authed) [Save to an application →] which pre-fills a new/selected application workspace. In-app version lives in the Requirements tab with identical output and stores on the application. Errors: empty input, > cap length (soft warn), unparseable → human message. Loading skeleton while analyzing.

---

### B7. CV matching (in application “Requirements/CV” area)

**Presentation:**
- **Summary line (honest):** “Your CV shows **8 of 11** requirements the job lists.” — plus how many are partial. Explicit note: “A missing item may simply not be in your CV yet — it doesn’t mean you lack the skill.”
- **Requirement rows** with three states and legend:
  - `✓ Found` (strong) — green check + evidence chips (section + snippet)
  - `⚠ Partially shown` (partial) — amber — e.g. “Mentioned once” or alias match
  - `✕ Not found in your CV` — neutral/red — with **[Add to CV]** action suggestion, not a claim you lack it.
- **Skill gap view:** three buckets — Strongly represented / Partially represented / Not represented — with language that distinguishes “not in CV” from “you don’t have it.” **[Explain]** on any row shows the evidence trail (trust/explainability, §22).
- Readiness nudges: “TypeScript is a must-have in this job but not in your CV → add a project or bullet that shows it (only if true).”

---

### B8. Cover letter builder

Editor (two-pane on desktop: content + print preview; single-pane on mobile). Structure scaffolded: Applicant info · Employer/position · Opening · Relevant experience · Why this role · Closing. Modes: **[Start from scratch]** (blank), **[Use template]**, **[Improve my draft]** (local, rule-based style suggestions — passive voice, weak openers — **no AI in V1**). Auto-saves to the application. [Download PDF] via same print pipeline. Tone guidance: honest, no fabricated facts; suggestions never invent employers/achievements/metrics.

---

### B9. Application checklist

- **Default checklist** generated per application (CV, Cover letter, Required documents, Job description reviewed, Contact details checked, …); “Application submitted” flips when status → Applied.
- Each item: checkbox + (custom items) delete; **[+ Add custom item]** inline.
- **Progress:** “Checklist 6/8 · 75%” bar; readiness view summarizes across applications’ items (B5).
- Completion recomputed client-side from items (never stored). Empty/loading/error handled as standard.

---

### B10. Interview preparation

- **Application interview tab:** add interview (date/time, type: phone/video/in-person/technical/panel/assessment, link/location, interviewer, notes, prep status, result); shows in Upcoming panel + timeline events; reschedule edits cleanly.
- **Interview Prep area:** pick Role/Experience level/Category → curated question library (general, behavioral, technical, role-specific, leadership, entry-level). Each question has “Save my STAR answer.”
- **STAR builder:** guided fields Situation → Task → Action → Result with help text and a “don’t invent results” reminder; answers saved per application or to a personal bank (`savedAnswers`) reusable across applications.
- **Prep checklist:** Research company · Review job description · Prepare introduction · Prepare STAR examples · Prepare questions for interviewer — with add-custom.

---

### B11. Mobile navigation

- **Public:** hamburger → slide-over with Tools/Resources/Pricing/Sign in + prominent “Create your CV.”
- **App:** **bottom tab bar** (5): Home · Applications · CVs · Tools · Profile. Secondary actions via a “+” floating action button (New application / New CV / New cover letter). Workspace tabs horizontally scrollable; editor uses the focused stepper (B3). All touch targets ≥44px.

---

### B12. Pricing

Honest, calm. Two tiers + note. **Free:** CV builder (basic templates), cover letter, application tracking, tools — *forever usable*. **Pro (placeholder pricing, no billing):** advanced templates, advanced analysis, AI (future), unlimited usage, advanced tracking, ad-free. Layout: toggle-free simple cards; FAQ below; clear “what’s free” so no dark patterns. CTA paths: [Start free] → signup (not forced if tool already usable); [See Pro features]. Premium-gated items marked with a small lock/Pro badge and explained, never hidden or faked.

---

### B13. Login / Signup

Single centered card. **Sign in:** email + password, “Forgot password?” link, “Continue with Google,” link to sign up. **Sign up:** email, password (with strength hint), name (optional now), “Create account,” Google, link to sign in; post-signup onboarding is **skippable** (B-note: optional 3-field card: professional title, experience level, career field — never a wall). Recover: email → sent state. All states have clear errors (wrong password, email in use, invalid email) in human copy + busy buttons. Guest mode preserved: “Not ready for an account? Keep using the free tools.” No forced registration anywhere.

---

### B14. Empty states

Every protected/tool surface has a designed empty state (never a blank screen, §82): illustration/icon + 1 sentence + one clear CTA:
- Applications list → “You don’t have any applications yet.” [Create your first application]
- CVs list → “You don’t have a CV yet.” [Create a CV]
- Requirements (unanalyzed) → “No job analysis yet.” [Analyze this job]
- Checklist (empty) → [Add your first item] / [Use the default checklist]
- Interviews → “No interviews scheduled.” [Add an interview]
- Notes, documents, timeline, saved answers → analogous.
Also helpful “hint” empty states inside tabbed workspace (B5). All CTAs funnel to the product loop.

---

### B15. Loading states

Patterns (no frozen screens, §83): page skeletons shaped like the content (cards/table rows/editor panes) via `loading.tsx`; button busy spinners with verb copy — “Saving CV…”, “Analyzing job…”, “Generating PDF…”, “Loading applications…”, “Checking requirements…”; autosave chip states (B3); tab/panel-level skeletons for workspace tabs; image/OG placeholders. Never a full-screen spinner for interactive panels.

---

### B16. Error states

Human-readable everywhere (§84). Route-level: centered friendly panel — icon, “We couldn’t load your applications,” explanation, [Try again] (and “Sign in again” when auth-related). Inline panel errors with [Retry] preserved user input. Form errors inline under fields with red border + `aria-describedby`. Global toast for transient failures. Raw codes never shown. Offline banner when `navigator.onLine` flips with auto-sync on return. Editor never loses content (A16).

---

## PART C — HOW WE PROCEED

1. **You approve this plan** (or adjust decisions).
2. I’ll ask the 5 **[OPEN]** questions, then begin **Phase 1** (scaffold) and move incrementally through the roadmap, building + running + testing each phase before the next (§120).
3. Each phase gets its own short architecture recap before code; nothing ships without green tests for its behavior.

---

*End of first deliverable — planning complete, awaiting approval before Phase 1.*
