import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { ProjectRole } from "@/app/generated/prisma/enums"

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

export type AccessRole = "owner" | "editor" | "viewer"

export interface AccessibleProject {
  id: string
  name: string
}

export type ProjectAccessResult =
  | { type: "unauthenticated" }
  | { type: "denied" }
  | { type: "granted"; project: AccessibleProject; role: AccessRole }

/**
 * Resolve a signed-in user's access to a project.
 *
 * Access tiers:
 *  - `owner`   — `Project.ownerId === userId`. Full edit rights.
 *  - `editor`  — `ProjectCollaborator` row with `role: EDITOR` (default for
 *                email-invited members).
 *  - `viewer`  — `ProjectCollaborator` row with `role: VIEWER`. Read-only.
 *                Additionally, if the project has `publicViewEnabled = true`
 *                and the signed-in user is not yet on the collaborator list,
 *                we auto-create a VIEWER row so the project appears in their
 *                `/shared` list and they can re-open the link without
 *                round-tripping through the share UI.
 *  - `denied`  — none of the above.
 */
export async function checkProjectAccess(projectId: string): Promise<ProjectAccessResult> {
  const identity = await getCurrentClerkIdentity()
  if (!identity) return { type: "unauthenticated" }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      publicViewEnabled: true,
      collaborators: identity.email
        ? {
            where: { email: identity.email.toLowerCase() },
            select: { id: true, role: true },
          }
        : false,
    },
  })

  if (!project) return { type: "denied" }

  if (project.ownerId === identity.userId) {
    return {
      type: "granted",
      project: { id: project.id, name: project.name },
      role: "owner",
    }
  }

  const existing = Array.isArray(project.collaborators)
    ? project.collaborators[0]
    : undefined
  if (existing) {
    return {
      type: "granted",
      project: { id: project.id, name: project.name },
      role: existing.role === ProjectRole.VIEWER ? "viewer" : "editor",
    }
  }

  if (project.publicViewEnabled && identity.email) {
    // First-time public-link visitor: auto-add as a VIEWER so the project
    // appears under /shared. We swallow unique-constraint races (P2002) so
    // two concurrent first visits don't 500.
    try {
      await prisma.projectCollaborator.create({
        data: {
          projectId: project.id,
          email: identity.email.toLowerCase(),
          role: ProjectRole.VIEWER,
        },
      })
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e !== null && "code" in e
          ? (e as { code?: string }).code
          : undefined
      if (code !== "P2002") throw e
    }
    return {
      type: "granted",
      project: { id: project.id, name: project.name },
      role: "viewer",
    }
  }

  return { type: "denied" }
}
