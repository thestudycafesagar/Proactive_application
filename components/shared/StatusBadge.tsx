import { Badge } from "@/components/ui/badge";

export type StatusType =
  | "active"
  | "pending"
  | "completed"
  | "inactive"
  | "error"
  | "warning";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let badgeColorClass = "";

  switch (normalizedStatus) {
    case "active":
    case "completed":
    case "success":
      variant = "default";
      badgeColorClass =
        "bg-green-100 text-green-800 hover:bg-green-100/80 border-transparent";
      break;
    case "pending":
    case "warning":
    case "in progress":
      variant = "secondary";
      badgeColorClass =
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-transparent";
      break;
    case "error":
    case "failed":
    case "inactive":
      variant = "destructive";
      badgeColorClass =
        "bg-red-100 text-red-800 hover:bg-red-100/80 border-transparent";
      break;
    default:
      variant = "outline";
      badgeColorClass =
        "bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-transparent";
  }

  const displayLabel =
    label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge
      variant={variant}
      className={`${badgeColorClass} ${className || ""}`}
    >
      {displayLabel}
    </Badge>
  );
}
