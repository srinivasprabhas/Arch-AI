"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Panel } from "@xyflow/react"
import { useOthers } from "@liveblocks/react/suspense"
import { useUser } from "@clerk/nextjs"

const MAX_VISIBLE = 5
const AVATAR_SIZE = 28

interface Collaborator {
  connectionId: number
  id: string
  name: string
  imageUrl: string | null
  color: string
}

interface CanvasPresenceAvatarsProps {
  rightOffset?: number
}

export function CanvasPresenceAvatars({ rightOffset = 0 }: CanvasPresenceAvatarsProps) {
  const others = useOthers()
  const { user } = useUser()
  const currentUserId = user?.id

  const collaborators = useMemo<Collaborator[]>(() => {
    const seen = new Set<string>()
    const list: Collaborator[] = []
    for (const other of others) {
      const userId = other.id
      if (!userId) continue
      if (userId === currentUserId) continue
      if (seen.has(userId)) continue
      seen.add(userId)
      list.push({
        connectionId: other.connectionId,
        id: userId,
        name: other.info?.name ?? "Collaborator",
        imageUrl: other.info?.avatar?.trim() ? other.info.avatar : null,
        color: other.info?.color ?? "#94A3B8",
      })
    }
    return list
  }, [others, currentUserId])

  if (collaborators.length === 0) return null

  const visible = collaborators.slice(0, MAX_VISIBLE)
  const overflow = collaborators.length - visible.length

  return (
    <Panel
      position="top-right"
      className="mt-2!"
      style={{
        marginRight: 8 + rightOffset,
        transition: "margin-right 300ms ease-in-out",
      }}
    >
      <div
        className="flex items-center gap-2"
        aria-label="Active collaborators"
      >
        <div className="flex items-center -space-x-1.5">
          {visible.map((collaborator) => (
            <CollaboratorAvatar key={collaborator.connectionId} collaborator={collaborator} />
          ))}
          {overflow > 0 && (
            <div
              className="relative grid place-items-center rounded-full bg-elevated text-[10px] font-semibold text-copy-primary ring-2 ring-bg-base"
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              aria-label={`${overflow} more collaborator${overflow === 1 ? "" : "s"}`}
              title={`${overflow} more`}
            >
              +{overflow}
            </div>
          )}
        </div>
        <div aria-hidden className="h-5 w-px bg-surface-border" />
      </div>
    </Panel>
  )
}

function CollaboratorAvatar({ collaborator }: { collaborator: Collaborator }) {
  const initials = getInitials(collaborator.name)
  return (
    <div
      className="relative overflow-hidden rounded-full ring-2 ring-bg-base"
      style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        backgroundColor: collaborator.color,
      }}
      title={collaborator.name}
      aria-label={collaborator.name}
    >
      {collaborator.imageUrl ? (
        <Image
          src={collaborator.imageUrl}
          alt=""
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold text-white">
          {initials}
        </span>
      )}
    </div>
  )
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return ((parts[0]![0] ?? "") + (parts[parts.length - 1]![0] ?? "")).toUpperCase()
}
