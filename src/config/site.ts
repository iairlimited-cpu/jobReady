/**
 * Central public-site configuration (JOBREADY-PLAN.md §A12, §B1).
 * Nav entries only point at routes that exist. As phases land
 * (auth, resources, pricing), extend these arrays — never hard-code links.
 */
export const siteConfig = {
  name: "JOBREADY",
  tagline: "Get your job application ready.",
  description:
    "Create your CV, tailor your application, organize your documents, track applications, and prepare for interviews — all in one place.",
  // Placeholder until the real support inbox is confirmed.
  email: "contact@jobready.example",
  nav: [
    { label: "Tools", href: "/tools" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ] as const,
  cta: { label: "Create your CV", href: "/tools" },
} as const;

export type SiteNavItem = (typeof siteConfig.nav)[number];
