import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getVercelClient } from "@/lib/org";
import { getOrgProjectAccess } from "@/lib/permissions";
import { MemberList } from "@/components/team/member-list";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { orgId, orgRole } = await auth();

  if (!orgId) redirect("/dashboard");
  if (orgRole !== "org:admin") redirect("/dashboard");

  const client = await clerkClient();
  const [memberships, vercel, projectAccess] = await Promise.all([
    client.organizations.getOrganizationMembershipList({ organizationId: orgId }),
    getVercelClient(),
    getOrgProjectAccess(),
  ]);

  const members = memberships.data.map((m) => ({
    userId: m.publicUserData?.userId ?? "",
    name: [m.publicUserData?.firstName, m.publicUserData?.lastName]
      .filter(Boolean)
      .join(" "),
    email: m.publicUserData?.identifier ?? "",
    role: m.role,
  }));

  let allProjects: { id: string; name: string }[] = [];
  if (vercel) {
    const data = await vercel.projects.getProjects({ limit: "100" });
    const raw = "projects" in data ? data.projects : [];
    allProjects = raw.map((p) => ({ id: p.id, name: p.name }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Access</h1>
        <p className="text-muted-foreground">
          Manage which projects each member can access. By default, members can
          see all projects.
        </p>
      </div>

      <MemberList
        members={members}
        allProjects={allProjects}
        initialAccess={projectAccess}
      />
    </div>
  );
}
