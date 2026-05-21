import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

interface RouteContext {
  params: Promise<{ projectId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { projectId } = await params

  const access = await checkProjectAccess(projectId)
  if (access.type === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (access.type === "denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    specs: specs.map((spec) => ({
      id: spec.id,
      filename: `${access.project.name || "spec"}-${spec.id}.md`.replace(
        /[\\/:*?"<>|\r\n]+/g,
        "-",
      ),
      createdAt: spec.createdAt.toISOString(),
    })),
  })
}
