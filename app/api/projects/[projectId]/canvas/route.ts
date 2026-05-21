import { NextResponse } from "next/server"
import { get, put } from "@vercel/blob"

import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"

interface RouteContext {
  params: Promise<{ projectId: string }>
}

interface CanvasPayload {
  nodes: unknown[]
  edges: unknown[]
}

function isCanvasPayload(value: unknown): value is CanvasPayload {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.nodes) && Array.isArray(v.edges)
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { projectId } = await params
  const access = await checkProjectAccess(projectId)
  if (access.type === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (access.type === "denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const raw = await request.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 })
  }
  if (!isCanvasPayload(parsed)) {
    return NextResponse.json(
      { error: "Body must include nodes and edges arrays" },
      { status: 400 },
    )
  }

  const blob = await put(`canvas/${projectId}.json`, raw, {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  })

  return NextResponse.json({ url: blob.url })
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

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  })

  if (!project?.canvasJsonPath) {
    return NextResponse.json({ canvas: null })
  }

  const blob = await get(project.canvasJsonPath, {
    access: "private",
    useCache: false,
  })
  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ canvas: null })
  }

  const canvas = (await new Response(blob.stream).json()) as unknown
  if (!isCanvasPayload(canvas)) {
    return NextResponse.json({ canvas: null })
  }

  return NextResponse.json({ canvas })
}
