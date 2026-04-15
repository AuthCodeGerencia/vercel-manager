"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

// "*" = all projects, [] = no projects, ["proj_1"] = specific list
export type ProjectAccess = Record<string, string[]>;

const ALL_PROJECTS_SENTINEL = "*";

async function getOrgMetadata(orgId: string) {
  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ organizationId: orgId });
  return org.privateMetadata ?? {};
}

export async function getOrgProjectAccess(): Promise<ProjectAccess> {
  const { orgId } = await auth();
  if (!orgId) return {};

  const metadata = await getOrgMetadata(orgId);
  const access = metadata.projectAccess;
  return typeof access === "object" && access !== null ? (access as ProjectAccess) : {};
}

// null = no restriction (sees all projects), string[] = only these project IDs
export async function getCurrentUserAllowedProjectIds(): Promise<string[] | null> {
  const { userId, orgRole } = await auth();
  if (!userId) return null;
  if (orgRole === "org:admin") return null;

  const access = await getOrgProjectAccess();
  if (!(userId in access)) return []; // no entry = no access by default

  const value = access[userId];
  if (value.includes(ALL_PROJECTS_SENTINEL)) return null; // all projects
  return value;
}

// grantAll: pass null to mean "all projects", [] for no access, string[] for specific
export async function setMemberProjectAccess(
  userId: string,
  projectIds: string[] | null
): Promise<void> {
  const { orgId, orgRole } = await auth();
  if (!orgId) throw new Error("No active organization");
  if (orgRole !== "org:admin") throw new Error("Only admins can manage project access");

  const client = await clerkClient();
  const metadata = await getOrgMetadata(orgId);
  const currentAccess = ((metadata.projectAccess as ProjectAccess) ?? {});

  // Store "*" as sentinel for "all projects" since Clerk strips null from metadata
  const stored = projectIds === null ? [ALL_PROJECTS_SENTINEL] : projectIds;

  await client.organizations.updateOrganizationMetadata(orgId, {
    privateMetadata: {
      ...metadata,
      projectAccess: { ...currentAccess, [userId]: stored },
    },
  });
}
