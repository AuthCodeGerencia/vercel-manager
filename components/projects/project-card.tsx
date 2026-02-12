import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/deployments/status-badge";
import { GitBranchIcon } from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  framework?: string | null;
  updatedAt?: number;
  latestDeploymentStatus?: string;
}

export function ProjectCard({
  id,
  name,
  framework,
  updatedAt,
  latestDeploymentStatus,
}: ProjectCardProps) {
  return (
    <Link href={`/dashboard/projects/${id}`}>
      <Card className="transition-colors hover:border-foreground/25">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">{name}</CardTitle>
          {latestDeploymentStatus && (
            <StatusBadge status={latestDeploymentStatus} />
          )}
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          {framework && (
            <span className="flex items-center gap-1">
              <GitBranchIcon className="h-3.5 w-3.5" />
              {framework}
            </span>
          )}
          {updatedAt && (
            <span>
              Updated{" "}
              {new Date(updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
