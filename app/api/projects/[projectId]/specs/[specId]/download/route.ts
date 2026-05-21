import { NextResponse } from "next/server"
import { get } from "@vercel/blob"

import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

interface RouteContext {
  params: Promise<{ projectId: string; specId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { projectId, specId } = await params

  const access = await checkProjectAccess(projectId)
  if (access.type === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (access.type === "denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
    select: { id: true, projectId: true, filePath: true, createdAt: true },
  })

  if (!spec) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (spec.projectId !== projectId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const blob = await get(spec.filePath, {
    access: "private",
    useCache: false,
  })

  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "Spec file unavailable" }, { status: 404 })
  }

  const filename = `${access.project.name || "spec"}-${spec.id}.md`
    .replace(/[\\/:*?"<>|\r\n]+/g, "-")

  return new Response(blob.stream, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
