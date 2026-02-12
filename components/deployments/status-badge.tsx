import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  READY: { label: "Ready", variant: "default" },
  BUILDING: { label: "Building", variant: "secondary" },
  QUEUED: { label: "Queued", variant: "secondary" },
  INITIALIZING: { label: "Initializing", variant: "secondary" },
  ERROR: { label: "Error", variant: "destructive" },
  CANCELED: { label: "Canceled", variant: "outline" },
  DELETED: { label: "Deleted", variant: "outline" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, variant: "outline" as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
