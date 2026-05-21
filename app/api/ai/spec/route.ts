import { NextResponse } from "next/server"
import { tasks } from "@trigger.dev/sdk/v3"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import {
  checkProjectAccess,
  getCurrentClerkIdentity,
} from "@/lib/project-access"
import { AiChatMessageSchema } from "@/types/tasks"
import type { generateSpecTask } from "@/src/trigger/generate-spec"

const SpecRequestNodeSchema = z.object({
  id: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
})

const SpecRequestEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
})

const SpecRequestSchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z.array(AiChatMessageSchema).default([]),
  nodes: z.array(SpecRequestNodeSchema).default([]),
  edges: z.array(SpecRequestEdgeSchema).default([]),
})

export async function POST(request: Request) {
  const identity = await getCurrentClerkIdentity()
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  if (json === null) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    )
  }

  const parsed = SpecRequestSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { roomId, chatHistory, nodes, edges } = parsed.data

  // Resolve project access from the authenticated user + roomId only.
  // Never trust a client-supplied projectId — the room id is the project id
  // in this app, and access goes through Prisma owner/collaborator checks.
  const access = await checkProjectAccess(roomId)
  if (access.type === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (access.type === "denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const projectId = access.project.id

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId,
    roomId,
    chatHistory,
    nodes,
    edges,
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
