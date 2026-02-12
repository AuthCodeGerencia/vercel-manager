"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getVercelClient } from "./org";

export async function saveVercelToken(token: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No active organization");

  const client = await clerkClient();
  await client.organizations.updateOrganizationMetadata(orgId, {
    privateMetadata: { vercelToken: token },
  });
}

export async function redeployAction(
  projectId: string,
  projectName: string,
  deploymentId: string
) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  const result = await vercel.deployments.createDeployment({
    requestBody: {
      name: projectName,
      deploymentId,
      target: "production",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);

  return { id: result.id };
}

export async function deployLatestAction(
  projectId: string,
  projectName: string,
  deploymentId: string
) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  const result = await vercel.deployments.createDeployment({
    requestBody: {
      name: projectName,
      deploymentId,
      target: "production",
      withLatestCommit: true,
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);

  return { id: result.id };
}

export async function getDeploymentStatusAction(deploymentId: string) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  const deployment = await vercel.deployments.getDeployment({
    idOrUrl: deploymentId,
  });

  return {
    readyState: "readyState" in deployment ? String(deployment.readyState) : "UNKNOWN",
  };
}
