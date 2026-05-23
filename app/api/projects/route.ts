import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const name =
    typeof body === "object" &&
    body !== null &&
    "name" in body &&
    typeof (body as Record<string, unknown>).name === "string" &&
    (body as Record<string, string>).name.trim() !== ""
      ? (body as Record<string, string>).name.trim()
      : "Untitled Project"

  const project = await prisma.project.create({
    data: { ownerId: userId, name },
  })

  // Keep the dashboard / projects listings fresh on soft navigation.
  revalidatePath("/dashboard")
  revalidatePath("/projects")

  return NextResponse.json(project, { status: 201 })
}
