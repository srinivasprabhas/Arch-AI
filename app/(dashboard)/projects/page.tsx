import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { getOwnedProjects } from "@/lib/projects"
import { CreateProjectButton } from "@/components/dashboard/create-project-button"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { SectionHeader } from "@/components/dashboard/section-header"

export default async function ProjectsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const projects = await getOwnedProjects(userId)

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#F3F4F6]">Projects</h1>
        <CreateProjectButton existingNames={projects.map((p) => p.name)} />
      </header>

      <section className="flex flex-col gap-4">
        <SectionHeader title="Your Projects" />
        <ProjectGrid
          projects={projects}
          emptyLabel="No projects yet. Create one to get started."
        />
      </section>
    </div>
  )
}
