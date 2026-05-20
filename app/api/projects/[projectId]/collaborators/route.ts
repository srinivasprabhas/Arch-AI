import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentClerkIdentity } from "@/lib/project-access"
import { enrichEmails } from "@/lib/clerk-users"

interface RouteContext {
  params: Promise<{ projectId: string }>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(_req: Request, { params }: RouteContext) {
  const identity = await getCurrentClerkIdentity()
  if (!identity) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      ownerId: true,
      collaborators: {
        select: { id: true, email: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = project.ownerId === identity.userId
  const isCollaborator = project.collaborators.some(
    (c) => c.email.toLowerCase() === identity.email.toLowerCase()
  )

  if (!isOwner && !isCollaborator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const enriched = await enrichEmails(project.collaborators.map((c) => c.email))

  const collaborators = project.collaborators.map((c) => {
    const info = enriched.get(c.email.toLowerCase())
    return {
      id: c.id,
      email: c.email,
      displayName: info?.displayName,
      imageUrl: info?.imageUrl,
    }
  })

  return NextResponse.json({ isOwner, collaborators })
}

export async function POST(request: Request, { params }: RouteContext) {
  const identity = await getCurrentClerkIdentity()
  if (!identity) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const rawEmail =
    typeof body === "object" && body !== null && "email" in body
      ? (body as Record<string, unknown>).email
      : null

  if (typeof rawEmail !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 })
  }

  const email = rawEmail.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "email is invalid" }, { status: 400 })
  }

  if (email === identity.email.toLowerCase()) {
    return NextResponse.json({ error: "Owner cannot be a collaborator" }, { status: 400 })
  }

  try {
    const collaborator = await prisma.projectCollaborator.create({
      data: { projectId, email },
      select: { id: true, email: true },
    })

    const enriched = await enrichEmails([email])
    const info = enriched.get(email)

    return NextResponse.json(
      {
        id: collaborator.id,
        email: collaborator.email,
        displayName: info?.displayName,
        imageUrl: info?.imageUrl,
      },
      { status: 201 }
    )
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Already a collaborator" }, { status: 409 })
    }
    throw e
  }
}
