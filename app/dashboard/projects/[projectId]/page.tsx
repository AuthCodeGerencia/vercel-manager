import { redirect } from "next/navigation";
import { getVercelClient } from "@/lib/org";
import { DeploymentTable } from "@/components/deployments/deployment-table";
import { DeployButton } from "@/components/deployments/deploy-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function DeploymentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const vercel = await getVercelClient();
  if (!vercel) redirect("/dashboard");

  const data = await vercel.deployments.getDeployments({
    projectId,
    limit: 50,
  });

  const projectName = data.deployments[0]?.name ?? projectId;

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
          <p className="text-muted-foreground">Recent deployments</p>
        </div>
        {data.deployments[0] && (
          <DeployButton
            projectId={projectId}
            projectName={projectName}
            latestDeploymentId={data.deployments[0].uid}
          />
        )}
      </div>

      <DeploymentTable deployments={data.deployments} projectId={projectId} />
    </div>
  );
}
