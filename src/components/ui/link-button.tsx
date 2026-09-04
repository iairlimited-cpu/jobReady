import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

/** An internal/external link styled as a button. */
export function LinkButton({
  href,
  variant,
  size,
  className,
  children,
  ...props
}: LinkButtonProps) {
  const isInternal = href.startsWith("/");
  const classes = buttonVariants({ variant, size, className });

  if (isInternal) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}
