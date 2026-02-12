import { auth } from "@clerk/nextjs/server";
import { getVercelClient } from "@/lib/org";
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

  const data = await vercel.projects.getProjects({ limit: "100" });
  const projects = "projects" in data ? data.projects : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          All projects in your Vercel account.
        </p>
      </div>
      <ProjectList projects={projects} />
    </div>
  );
}
