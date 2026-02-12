import { ExternalLinkIcon, GitBranchIcon, ClockIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/deployments/status-badge";
import { RedeployButton } from "@/components/deployments/redeploy-button";

interface DeploymentHeaderProps {
  id: string;
  projectId: string;
  projectName: string;
  readyState: string;
  url: string;
  createdAt: number;
  buildingAt?: number;
  ready?: number;
  target?: string | null;
  meta: Record<string, string>;
  source?: string;
}

export function DeploymentHeader({
  id,
  projectId,
  projectName,
  readyState,
  url,
  createdAt,
  buildingAt,
  ready,
  target,
  meta,
  source,
}: DeploymentHeaderProps) {
  const branch = meta?.githubCommitRef ?? meta?.gitlabCommitRef ?? null;
  const commitSha = meta?.githubCommitSha ?? meta?.gitlabCommitSha ?? null;
  const commitMessage = meta?.githubCommitMessage ?? meta?.gitlabCommitMessage ?? null;

  const duration =
    buildingAt && ready
      ? Math.round((ready - buildingAt) / 1000)
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={readyState} />
          <h1 className="text-xl font-bold tracking-tight">{projectName}</h1>
        </div>
        <RedeployButton
          projectId={projectId}
          projectName={projectName}
          deploymentId={id}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {url && (
          <a
            href={`https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            {url}
          </a>
        )}
        {branch && (
          <span className="flex items-center gap-1">
            <GitBranchIcon className="h-3.5 w-3.5" />
            {branch}
          </span>
        )}
        {duration !== null && (
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {duration}s
          </span>
        )}
        <span className="capitalize">{target ?? "preview"}</span>
        {source && <span>via {source}</span>}
      </div>

      {commitMessage && (
        <p className="text-sm">
          {commitSha && (
            <code className="mr-2 text-xs text-muted-foreground">
              {commitSha.slice(0, 7)}
            </code>
          )}
          {commitMessage}
        </p>
      )}

      <div className="text-xs text-muted-foreground">
        Created{" "}
        {new Date(createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </div>

      <Separator />
    </div>
  );
}
