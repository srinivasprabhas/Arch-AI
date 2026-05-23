import { redirect } from "next/navigation"
import { AccessDenied } from "@/components/editor/access-denied"
import { Workspace } from "@/components/editor/workspace"
import { checkProjectAccess } from "@/lib/project-access"

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { projectId } = await params
  const result = await checkProjectAccess(projectId)

  if (result.type === "unauthenticated") {
    redirect("/sign-in")
  }

  if (result.type === "denied") {
    return <AccessDenied />
  }

  return (
    <Workspace
      project={{
        id: result.project.id,
        name: result.project.name,
        role: result.role,
      }}
    />
  )
}
