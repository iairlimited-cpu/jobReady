import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export function SectionCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`p-6 sm:p-8 ${className ?? ""}`.trim()}>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="mt-6 flex flex-col gap-5">{children}</div>
      {footer ? (
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
