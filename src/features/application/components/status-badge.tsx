import { Badge, type BadgeProps } from "@/components/ui/badge";
import { STATUS_META, type ApplicationStatus } from "@/features/application/types";

export function StatusBadge({
  status,
  ...props
}: { status: ApplicationStatus } & Omit<BadgeProps, "variant">) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.tone as BadgeProps["variant"]} {...props}>
      {meta.label}
    </Badge>
  );
}
