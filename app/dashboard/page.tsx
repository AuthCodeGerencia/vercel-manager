import { auth } from "@clerk/nextjs/server";
import { getVercelClient, listProjects } from "@/lib/org";
import { getCurrentUserAllowedProjectIds } from "@/lib/permissions";
import { ProjectList } from "@/components/projects/project-list";
import { TokenSetup } from "@/components/org/token-setup";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { orgId } = await auth();

  if (!orgId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">No Organization Selected</h2>
          <p className="text-muted-foreground">
            Create or select an organization using the switcher in the header to get started.
          </p>
        </div>
      </div>
    );
  }

  const vercel = await getVercelClient();

  if (!vercel) {
    return <TokenSetup />;
  }

  const [rawProjects, allowedProjectIds] = await Promise.all([
    listProjects(100),
    getCurrentUserAllowedProjectIds(),
  ]);

  const projects = rawProjects.map((p) => {
    const aliasArray = p.alias;
    const prodAlias = aliasArray?.find((a) => a.target === "PRODUCTION");
    const firstAlias = aliasArray?.[0];
    return {
      id: p.id,
      name: p.name,
      framework: p.framework,
      updatedAt: p.updatedAt,
      latestDeployments: p.latestDeployments as Array<{ readyState: string }> | undefined,
      domain: prodAlias?.domain ?? firstAlias?.domain ?? null,
    };
  });

  const visibleProjects =
    allowedProjectIds === null
      ? projects
      : projects.filter((p) => allowedProjectIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          All projects in your Vercel account.
        </p>
      </div>
      <ProjectList projects={visibleProjects} />
    </div>
  );
}
