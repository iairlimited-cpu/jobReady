import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

/** Accessible labelled <textarea>. */
export function TextareaField({
  label,
  hint,
  error,
  className,
  required,
  ...textareaProps
}: TextareaFieldProps) {
  const autoId = useId();
  const id = textareaProps.id ?? autoId;
  const describedBy =
    [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        required={required}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors",
          "placeholder:text-muted-foreground/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive",
          className,
        )}
        {...textareaProps}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
