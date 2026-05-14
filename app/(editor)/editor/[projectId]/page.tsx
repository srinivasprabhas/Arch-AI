import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  })

  if (!project) redirect("/editor")

  return (
    <div className="flex flex-1 h-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center max-w-sm px-4">
        <h1 className="text-lg font-semibold text-copy-primary">{project.name}</h1>
        <p className="text-xs text-copy-faint font-mono">{project.id}</p>
      </div>
    </div>
  )
}
