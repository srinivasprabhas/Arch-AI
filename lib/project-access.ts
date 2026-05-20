import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export interface ClerkIdentity {
  userId: string
  email: string
}

export async function getCurrentClerkIdentity(): Promise<ClerkIdentity | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ""
  return { userId, email }
}

export interface AccessibleProject {
  id: string
  name: string
}

export type ProjectAccessResult =
  | { type: "unauthenticated" }
  | { type: "denied" }
  | { type: "granted"; project: AccessibleProject }

export async function checkProjectAccess(projectId: string): Promise<ProjectAccessResult> {
  const identity = await getCurrentClerkIdentity()
  if (!identity) return { type: "unauthenticated" }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: identity.email
        ? { where: { email: identity.email }, select: { id: true } }
        : false,
    },
  })

  if (!project) return { type: "denied" }

  const isOwner = project.ownerId === identity.userId
  const isCollaborator = Array.isArray(project.collaborators) && project.collaborators.length > 0

  if (!isOwner && !isCollaborator) return { type: "denied" }

  return { type: "granted", project: { id: project.id, name: project.name } }
}
