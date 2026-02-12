import { ProjectCard } from "./project-card";

interface Project {
  id: string;
  name: string;
  framework?: string | null;
  updatedAt?: number;
  latestDeployments?: Array<{ readyState: string }>;
}

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No projects found.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          name={project.name}
          framework={project.framework}
          updatedAt={project.updatedAt}
          latestDeploymentStatus={project.latestDeployments?.[0]?.readyState}
        />
      ))}
    </div>
  );
}
