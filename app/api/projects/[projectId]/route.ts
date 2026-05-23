import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{ projectId: string }>
}

interface PatchPayload {
  name?: string
  publicViewEnabled?: boolean
}

function parsePatchPayload(raw: unknown): PatchPayload | { error: string } {
  if (typeof raw !== "object" || raw === null) return {}
  const body = raw as Record<string, unknown>
  const out: PatchPayload = {}
  if ("name" in body) {
    if (typeof body.name !== "string" || body.name.trim() === "") {
      return { error: "name must be a non-empty string" }
    }
    out.name = body.name.trim()
  }
  if ("publicViewEnabled" in body) {
    if (typeof body.publicViewEnabled !== "boolean") {
      return { error: "publicViewEnabled must be a boolean" }
    }
    out.publicViewEnabled = body.publicViewEnabled
  }
  return out
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const parsed = parsePatchPayload(body)
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  if (parsed.name === undefined && parsed.publicViewEnabled === undefined) {
    return NextResponse.json(
      { error: "name or publicViewEnabled is required" },
      { status: 400 }
    )
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.publicViewEnabled !== undefined
        ? { publicViewEnabled: parsed.publicViewEnabled }
        : {}),
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/projects")
  revalidatePath("/shared")

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.project.delete({ where: { id: projectId } })

  revalidatePath("/dashboard")
  revalidatePath("/projects")
  revalidatePath("/shared")

  return new NextResponse(null, { status: 204 })
}
