"use client"

import { useMemo } from "react"
import { useOthers } from "@liveblocks/react"
import { useUser } from "@clerk/nextjs"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const MAX_VISIBLE = 4

interface Collaborator {
  id: string
  name: string
  imageUrl: string | null
  color: string
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return ((parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")).toUpperCase()
}

export function CollaboratorAvatars() {
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
        id: userId,
        name: other.info?.name ?? "Collaborator",
        imageUrl: other.info?.avatar?.trim() ? other.info.avatar : null,
        color: other.info?.color ?? "#9CA3AF",
      })
    }
    return list
  }, [others, currentUserId])

  if (collaborators.length === 0) {
    return (
      <span className="px-1 text-[11px] text-[#9CA3AF]">Only you</span>
    )
  }

  const visible = collaborators.slice(0, MAX_VISIBLE)
  const overflow = collaborators.length - visible.length

  return (
    <AvatarGroup
      className="grayscale hover:grayscale-0 transition-[filter] duration-150 ease-out"
      aria-label={`${collaborators.length} collaborator${collaborators.length === 1 ? "" : "s"} active`}
    >
      {visible.map((c) => (
        <Avatar
          key={c.id}
          title={c.name}
          className={cn(
            "h-8 w-8 ring-2 ring-[#18181C]",
            "hover:grayscale-0 transition-[filter] duration-150 ease-out",
          )}
        >
          {c.imageUrl ? (
            <AvatarImage src={c.imageUrl} alt={c.name} />
          ) : null}
          <AvatarFallback
            style={{ backgroundColor: c.color }}
            className="text-[10px] font-semibold text-white"
          >
            {getInitials(c.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <AvatarGroupCount aria-label={`${overflow} more`}>
          +{overflow}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
