import { NextResponse } from "next/server"
import { auth as triggerAuth } from "@trigger.dev/sdk/v3"

import { prisma } from "@/lib/prisma"
import { getCurrentClerkIdentity } from "@/lib/project-access"

interface TokenRequestBody {
  runId?: unknown
}

export async function POST(request: Request) {
  const identity = await getCurrentClerkIdentity()
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as TokenRequestBody
  const runId = typeof body.runId === "string" ? body.runId.trim() : ""

  if (!runId) {
    return NextResponse.json(
      { error: "runId is required" },
      { status: 400 },
    )
  }

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } })

  if (!taskRun) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (taskRun.userId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: { runs: [runId] },
    },
    expirationTime: "1h",
  })

  return NextResponse.json({ token })
}
