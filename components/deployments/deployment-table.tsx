import Link from "next/link";
import { GitCommitHorizontalIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";

interface Deployment {
  uid: string;
  url: string;
  state?: string;
  created: number;
  target?: string | null;
  creator: { username?: string; email?: string };
  meta?: Record<string, string>;
}

interface DeploymentTableProps {
  deployments: Deployment[];
  projectId: string;
}

export function DeploymentTable({ deployments, projectId }: DeploymentTableProps) {
  if (deployments.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No deployments found.
      </p>
    );
  }

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Commit</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Environment</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Creator</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deployments.map((d) => (
          <TableRow key={d.uid}>
            <TableCell>
              <Link href={`/dashboard/projects/${projectId}/deployments/${d.uid}`}>
                <StatusBadge status={d.state ?? "UNKNOWN"} />
              </Link>
            </TableCell>
            <TableCell className="max-w-[200px] truncate font-mono text-xs">
              <Link
                href={`/dashboard/projects/${projectId}/deployments/${d.uid}`}
                className="hover:underline"
              >
                {d.url}
              </Link>
            </TableCell>
            <TableCell className="max-w-[250px] text-sm">
              <CommitCell meta={d.meta} />
            </TableCell>
            <TableCell className="text-sm">
              {d.meta?.githubCommitRef ?? d.meta?.gitlabCommitRef ?? "-"}
            </TableCell>
            <TableCell className="text-sm capitalize">
              {d.target ?? "preview"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(d.created).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell className="text-sm">
              {d.creator.username ?? d.creator.email ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CommitCell({ meta }: { meta?: Record<string, string> }) {
  const message = meta?.githubCommitMessage ?? meta?.gitlabCommitMessage ?? null;
  const sha = meta?.githubCommitSha ?? meta?.gitlabCommitSha ?? null;
  const org = meta?.githubCommitOrg ?? meta?.gitlabProjectNamespace ?? null;
  const repo = meta?.githubCommitRepo ?? meta?.gitlabProjectPath ?? null;

  if (!message && !sha) return <span className="text-muted-foreground">-</span>;

  const commitUrl =
    org && repo && sha ? `https://github.com/${org}/${repo}/commit/${sha}` : null;

  return (
    <div className="flex items-start gap-1.5">
      <GitCommitHorizontalIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="truncate">{message ?? "No message"}</p>
        {sha && (
          commitUrl ? (
            <a
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              {sha.slice(0, 7)}
            </a>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">
              {sha.slice(0, 7)}
            </span>
          )
        )}
      </div>
    </div>
  );
}
