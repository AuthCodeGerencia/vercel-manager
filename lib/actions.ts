"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getVercelClient } from "./org";
import { setMemberProjectAccess } from "./permissions";

async function getGithubToken(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;
  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ organizationId: orgId });
  const token = org.privateMetadata?.githubToken;
  return typeof token === "string" ? token : null;
}

export async function saveGithubTokenAction(token: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No active organization");
  const client = await clerkClient();
  await client.organizations.updateOrganizationMetadata(orgId, {
    privateMetadata: { githubToken: token },
  });
}

export async function triggerGitHubDeployAction(
  owner: string,
  repo: string,
  branch: string
) {
  const token = await getGithubToken();
  if (!token) throw new Error("No GitHub token configured");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  const base = "https://api.github.com";

  const refRes = await fetch(`${base}/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers });
  if (!refRes.ok) throw new Error(`GitHub: failed to get ref (${refRes.status})`);
  const { object: { sha: currentSha } } = await refRes.json();

  const commitRes = await fetch(`${base}/repos/${owner}/${repo}/git/commits/${currentSha}`, { headers });
  if (!commitRes.ok) throw new Error(`GitHub: failed to get commit (${commitRes.status})`);
  const { tree: { sha: treeSha } } = await commitRes.json();

  const newCommitRes = await fetch(`${base}/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: "chore: trigger deploy [skip ci]",
      tree: treeSha,
      parents: [currentSha],
    }),
  });
  if (!newCommitRes.ok) throw new Error(`GitHub: failed to create commit (${newCommitRes.status})`);
  const { sha: newSha } = await newCommitRes.json();

  const updateRes = await fetch(`${base}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ sha: newSha }),
  });
  if (!updateRes.ok) throw new Error(`GitHub: failed to update ref (${updateRes.status})`);

  return { sha: newSha };
}

export async function setProjectAccessAction(
  userId: string,
  projectIds: string[] | null
): Promise<void> {
  await setMemberProjectAccess(userId, projectIds);
}

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

export async function listEnvVarsAction(projectId: string) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  const result = await vercel.projects.filterProjectEnvs({ idOrName: projectId });

  if ("envs" in result) return result.envs;
  return [];
}

export async function createEnvVarAction(
  projectId: string,
  data: { key: string; value: string; target: string[]; type: string }
) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  await vercel.projects.createProjectEnv({
    idOrName: projectId,
    upsert: "true",
    requestBody: {
      key: data.key,
      value: data.value,
      type: data.type as "plain" | "encrypted" | "sensitive" | "secret",
      target: data.target as Array<"production" | "preview" | "development">,
      customEnvironmentIds: [],
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateEnvVarAction(
  projectId: string,
  envId: string,
  data: { key: string; value: string; target: string[]; type: string }
) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  await vercel.projects.editProjectEnv({
    idOrName: projectId,
    id: envId,
    requestBody: {
      key: data.key,
      value: data.value,
      type: data.type as "plain" | "encrypted" | "sensitive" | "secret",
      target: data.target as Array<"production" | "preview" | "development">,
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteEnvVarAction(projectId: string, envId: string) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  await vercel.projects.removeProjectEnv({
    idOrName: projectId,
    id: envId,
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function revealEnvVarAction(projectId: string, envId: string) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  const result = await vercel.projects.getProjectEnv({
    idOrName: projectId,
    id: envId,
  });

  return { value: "value" in result ? result.value : "" };
}

export async function listProjectDomainsAction(projectId: string) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  const result = await vercel.projects.getProjectDomains({ idOrName: projectId });
  const domains = "domains" in result ? result.domains : [];

  const configs = await Promise.all(
    domains.map((d) =>
      vercel.domains
        .getDomainConfig({ domain: d.name, projectIdOrName: projectId })
        .catch(() => null)
    )
  );

  return domains.map((d, i) => ({
    name: d.name,
    apexName: d.apexName,
    verified: d.verified,
    redirect: d.redirect ?? null,
    gitBranch: d.gitBranch ?? null,
    createdAt: d.createdAt ?? null,
    verification: d.verification ?? [],
    config: configs[i]
      ? {
          configuredBy: configs[i].configuredBy,
          misconfigured: configs[i].misconfigured,
          recommendedIPv4: configs[i].recommendedIPv4,
          recommendedCNAME: configs[i].recommendedCNAME,
        }
      : null,
  }));
}

export async function addProjectDomainAction(projectId: string, name: string) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  const result = await vercel.projects.addProjectDomain({
    idOrName: projectId,
    requestBody: { name },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  return {
    name: result.name,
    verified: result.verified,
    verification: result.verification ?? [],
  };
}

export async function removeProjectDomainAction(projectId: string, domain: string) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  await vercel.projects.removeProjectDomain({ idOrName: projectId, domain });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function verifyProjectDomainAction(projectId: string, domain: string) {
  const vercel = await getVercelClient();
  if (!vercel) throw new Error("No Vercel token configured");

  const result = await vercel.projects.verifyProjectDomain({
    idOrName: projectId,
    domain,
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { verified: result.verified };
}
