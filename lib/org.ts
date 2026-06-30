"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { Vercel } from "@vercel/sdk";

export async function getVercelToken(): Promise<string | null> {
  const { orgId } = await auth();
  if (!orgId) return null;

  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ organizationId: orgId });
  const token = org.privateMetadata?.vercelToken;
  return typeof token === "string" ? token : null;
}

export async function getVercelClient(): Promise<Vercel | null> {
  const token = await getVercelToken();
  if (!token) return null;
  return new Vercel({ bearerToken: token });
}

export type VercelProject = {
  id: string;
  name: string;
  framework?: string | null;
  updatedAt?: number;
  latestDeployments?: Array<{ readyState: string }>;
  alias?: Array<{ domain: string; target?: string }>;
};

/**
 * Fetch the projects list directly from the Vercel REST API.
 *
 * The typed SDK (`vercel.projects.getProjects`) validates responses with Zod,
 * and Vercel periodically returns new `framework` values (e.g. "container")
 * that aren't in the SDK's enum yet. That makes the SDK throw a
 * ResponseValidationError on an otherwise-successful 200 response. Calling the
 * REST endpoint ourselves keeps project listing resilient to that enum drift.
 */
export async function listProjects(limit = 100): Promise<VercelProject[]> {
  const token = await getVercelToken();
  if (!token) return [];

  const res = await fetch(`https://api.vercel.com/v10/projects?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to list Vercel projects: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { projects?: VercelProject[] };
  return data.projects ?? [];
}

export async function hasGithubToken(): Promise<boolean> {
  const { orgId } = await auth();
  if (!orgId) return false;
  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ organizationId: orgId });
  return typeof org.privateMetadata?.githubToken === "string";
}
