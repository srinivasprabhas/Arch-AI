import { prisma } from "@/lib/prisma"

export interface ProjectData {
  id: string
  name: string
  isOwned: boolean
}

export async function getOwnedProjects(userId: string): Promise<ProjectData[]> {
  const rows = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  })
  return rows.map((r) => ({ ...r, isOwned: true }))
}

export async function getSharedProjects(userEmail: string): Promise<ProjectData[]> {
  if (!userEmail) return []
  const rows = await prisma.projectCollaborator.findMany({
    where: { email: userEmail },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return rows.map((r) => ({ id: r.project.id, name: r.project.name, isOwned: false }))
}
