import { ProjectCard } from "@/components/dashboard/project-card"
import type { ProjectData } from "@/lib/projects"

interface ProjectGridProps {
  projects: ProjectData[]
  emptyLabel?: string
}

export function ProjectGrid({ projects, emptyLabel }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-[#9CA3AF] py-6">
        {emptyLabel ?? "No projects yet."}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          projectId={p.id}
          name={p.name}
          updatedAt={p.updatedAt}
        />
      ))}
    </div>
  )
}
