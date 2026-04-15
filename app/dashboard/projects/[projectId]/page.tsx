import { redirect } from "next/navigation";
import Link from "next/link";
import { getVercelClient } from "@/lib/org";
import { getCurrentUserAllowedProjectIds } from "@/lib/permissions";
import { listEnvVarsAction, listProjectDomainsAction } from "@/lib/actions";
import { DeploymentTable } from "@/components/deployments/deployment-table";
import { DeployButton } from "@/components/deployments/deploy-button";
import { EnvVarsSection } from "@/components/env/env-vars-section";
import { DomainList } from "@/components/domains/domain-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "deployments", label: "Deployments" },
  { id: "env", label: "Environment Variables" },
  { id: "domains", label: "Domains" },
];

export default async function DeploymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ projectId }, { tab = "deployments" }] = await Promise.all([
    params,
    searchParams,
  ]);

  const [vercel, allowedProjectIds] = await Promise.all([
    getVercelClient(),
    getCurrentUserAllowedProjectIds(),
  ]);
  if (!vercel) redirect("/dashboard");
  if (allowedProjectIds !== null && !allowedProjectIds.includes(projectId)) {
    redirect("/dashboard");
  }

  const [deploymentsData, envVars, domains] = await Promise.all([
    vercel.deployments.getDeployments({ projectId, limit: tab === "deployments" ? 50 : 1 }),
    tab === "env" ? listEnvVarsAction(projectId) : null,
    tab === "domains" ? listProjectDomainsAction(projectId) : null,
  ]);

  const projectName = deploymentsData.deployments[0]?.name ?? projectId;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{projectName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{projectName}</h1>
        </div>
        {tab === "deployments" && deploymentsData.deployments[0] && (
          <DeployButton
            projectId={projectId}
            projectName={projectName}
            latestDeploymentId={deploymentsData.deployments[0].uid}
          />
        )}
      </div>

      <nav className="flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/projects/${projectId}?tab=${t.id}`}
            className={cn(
              "px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
              tab === t.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "deployments" && (
        <DeploymentTable deployments={deploymentsData.deployments} projectId={projectId} />
      )}

      {tab === "env" && envVars && (
        <EnvVarsSection
          projectId={projectId}
          envs={envVars.map((e) => ({
            id: e.id ?? "",
            key: e.key,
            value: e.value ?? "",
            type: e.type,
            target: Array.isArray(e.target)
              ? (e.target as string[])
              : e.target
              ? [e.target as string]
              : [],
          }))}
        />
      )}

      {tab === "domains" && domains && (
        <DomainList projectId={projectId} initialDomains={domains} />
      )}
    </div>
  );
}
