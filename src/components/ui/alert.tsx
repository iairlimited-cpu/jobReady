import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type AlertVariant = "error" | "info" | "success";

const variantClasses: Record<AlertVariant, string> = {
  error:
    "border-destructive/30 bg-destructive-soft text-destructive-soft-foreground",
  info: "border-border bg-muted text-muted-foreground",
  success: "border-success/30 bg-success-soft text-success-foreground",
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

/** Inline message banner. Errors use role="alert" so they are announced. */
export function Alert({
  variant = "info",
  className,
  role,
  ...props
}: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : role}
      className={cn(
        "rounded-md border px-4 py-3 text-sm leading-relaxed",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
