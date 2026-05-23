import { prisma } from "@/lib/prisma"

export interface ProjectData {
  id: string
  name: string
  isOwned: boolean
  /**
   * ISO timestamp of the project's last DB mutation. Bumped by Prisma's
   * `@updatedAt` on every write, including the autosave PUT that swaps
   * the canvas blob URL. The dashboard `ProjectCard` includes this in
   * its fetch-effect deps so card content re-fetches when the canvas
   * changes — without it, navigating away + back to the dashboard
   * shows a stale preview because React reuses the card instances and
   * the projectId-only effect never re-fires.
   */
  updatedAt: string
}

export async function getOwnedProjects(userId: string): Promise<ProjectData[]> {
  const rows = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    isOwned: true,
    updatedAt: r.updatedAt.toISOString(),
  }))
}

export async function getSharedProjects(userEmail: string): Promise<ProjectData[]> {
  if (!userEmail) return []
  const rows = await prisma.projectCollaborator.findMany({
    where: { email: userEmail },
    include: { project: { select: { id: true, name: true, updatedAt: true } } },
    orderBy: { createdAt: "desc" },
  })
  return rows.map((r) => ({
    id: r.project.id,
    name: r.project.name,
    isOwned: false,
    updatedAt: r.project.updatedAt.toISOString(),
  }))
}
