import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";

/** Shared closing call-to-action band for public pages. */
export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="bg-muted/60 py-16 sm:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2
          id="cta-heading"
          className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          You have a job in mind. Let&apos;s get you ready.
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Build your CV, understand what the job needs, and organize every step of
          your application — all in one calm workspace.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/tools" size="lg">
            Start My Application
          </LinkButton>
          <LinkButton href="/#how-it-works" variant="outline" size="lg">
            See how it works
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
