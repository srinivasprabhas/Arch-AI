import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { checkProjectAccess } from "@/lib/project-access"
import { getCursorColorForUser, getLiveblocksClient } from "@/lib/liveblocks"

interface LiveblocksAuthBody {
  room?: unknown
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LiveblocksAuthBody
  const room = typeof body.room === "string" ? body.room : null
  if (!room) {
    return NextResponse.json({ error: "room is required" }, { status: 400 })
  }

  const access = await checkProjectAccess(room)
  if (access.type === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (access.type === "denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const fullName = user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ")
  const name =
    fullName.trim() !== ""
      ? fullName.trim()
      : user.emailAddresses[0]?.emailAddress ?? user.id

  const avatar = user.imageUrl ?? ""
  const color = getCursorColorForUser(user.id)

  const liveblocks = getLiveblocksClient()

  await liveblocks.getOrCreateRoom(room, {
    defaultAccesses: ["room:write"],
  })

  const session = liveblocks.prepareSession(user.id, {
    userInfo: { name, avatar, color },
  })
  // Viewers (public-link visitors + role=VIEWER collaborators) get read-only
  // access to the Liveblocks room so they can observe storage + presence but
  // can't mutate the canvas. Owners and editors get full access.
  if (access.role === "viewer") {
    session.allow(room, session.READ_ACCESS)
  } else {
    session.allow(room, session.FULL_ACCESS)
  }

  const { status, body: tokenBody } = await session.authorize()
  return new Response(tokenBody, { status })
}
