import { redirect } from "next/navigation";
import { getVercelClient } from "@/lib/org";
import { DeploymentHeader } from "@/components/deployment-detail/deployment-header";
import { DeploymentLogs } from "@/components/deployment-detail/deployment-logs";
import { StatusPoller } from "@/components/deployment-detail/status-poller";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function DeploymentDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; deploymentId: string }>;
}) {
  const { projectId, deploymentId } = await params;

  const vercel = await getVercelClient();
  if (!vercel) redirect("/dashboard");

  const [deployment, events] = await Promise.all([
    vercel.deployments.getDeployment({ idOrUrl: deploymentId }),
    vercel.deployments.getDeploymentEvents({
      idOrUrl: deploymentId,
      direction: "forward",
      limit: -1,
    }),
  ]);

  const readyState =
    "readyState" in deployment ? String(deployment.readyState) : "UNKNOWN";
  const name = "name" in deployment ? deployment.name : projectId;
  const url = "url" in deployment ? deployment.url : "";
  const createdAt = "createdAt" in deployment ? deployment.createdAt : 0;
  const buildingAt =
    "buildingAt" in deployment ? (deployment.buildingAt as number | undefined) : undefined;
  const ready =
    "ready" in deployment ? (deployment.ready as number | undefined) : undefined;
  const target =
    "target" in deployment ? (deployment.target as string | null) : null;
  const meta =
    "meta" in deployment ? (deployment.meta as Record<string, string>) : {};
  const source =
    "source" in deployment ? (deployment.source as string | undefined) : undefined;
  const id = "id" in deployment ? deployment.id : deploymentId;

  const logEvents = Array.isArray(events)
    ? events
        .filter((e) => e !== null && "id" in e && "type" in e && "date" in e)
        .map((e) => {
          const ev = e as Record<string, unknown>;
          return {
            id: ev.id as string,
            text: ev.text as string | undefined,
            type: ev.type as string,
            date: ev.date as number,
          };
        })
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/projects/${projectId}`}>
              {name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{id.slice(0, 12)}...</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DeploymentHeader
        id={id}
        projectId={projectId}
        projectName={name}
        readyState={readyState}
        url={url}
        createdAt={createdAt}
        buildingAt={buildingAt}
        ready={ready}
        target={target}
        meta={meta}
        source={source}
      />

      <DeploymentLogs events={logEvents} />

      <StatusPoller deploymentId={id} initialState={readyState} />
    </div>
  );
}
