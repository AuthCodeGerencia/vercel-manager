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
