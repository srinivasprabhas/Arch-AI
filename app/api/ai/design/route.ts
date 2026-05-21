import { NextResponse } from "next/server"
import { tasks } from "@trigger.dev/sdk/v3"
import { prisma } from "@/lib/prisma"
import { checkProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access"
import type { designAgentTask } from "@/src/trigger/design-agent"

interface DesignRequestBody {
  prompt?: unknown
  roomId?: unknown
  projectId?: unknown
}

export async function POST(request: Request) {
  const identity = await getCurrentClerkIdentity()
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as DesignRequestBody

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : ""
  const roomId = typeof body.roomId === "string" ? body.roomId.trim() : ""
  const projectId = typeof body.projectId === "string" ? body.projectId.trim() : ""

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 })
  }
  if (!roomId) {
    return NextResponse.json({ error: "roomId is required" }, { status: 400 })
  }
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 })
  }

  const access = await checkProjectAccess(projectId)
  if (access.type === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (access.type === "denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt,
    roomId,
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId: identity.userId,
    },
  })

  return NextResponse.json({ runId: handle.id }, { status: 201 })
}
