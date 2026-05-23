import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { getOwnedProjects } from "@/lib/projects"
import { STARTER_TEMPLATES } from "@/lib/templates"
import { CreateProjectButton } from "@/components/dashboard/create-project-button"
import { DashboardRevalidator } from "@/components/dashboard/dashboard-revalidator"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { SectionDivider, SectionHeader } from "@/components/dashboard/section-header"
import { TemplateCard } from "@/components/dashboard/template-card"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const ownedProjects = await getOwnedProjects(userId)

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <DashboardRevalidator />
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#F3F4F6]">Dashboard</h1>
        <CreateProjectButton existingNames={ownedProjects.map((p) => p.name)} />
      </header>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Templates" />
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <div className="flex flex-row gap-4 min-w-max">
            {STARTER_TEMPLATES.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="flex flex-col gap-4">
        <SectionHeader title="Your Projects" />
        <ProjectGrid
          projects={ownedProjects}
          emptyLabel="No projects yet. Create one to get started."
        />
      </section>
    </div>
  )
}
