import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { getSharedProjects } from "@/lib/projects"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { SectionHeader } from "@/components/dashboard/section-header"

export default async function SharedPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ""
  const projects = email ? await getSharedProjects(email) : []

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#F3F4F6]">Shared</h1>
      </header>

      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Shared with you"
          description="Projects others have invited you to collaborate on."
        />
        <ProjectGrid
          projects={projects}
          emptyLabel="No shared projects yet."
        />
      </section>
    </div>
  )
}
