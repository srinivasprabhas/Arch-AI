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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
      aria-label={`${collaborators.length} collaborator${collaborators.length === 1 ? "" : "s"} active`}
    >
      {visible.map((c) => (
        <CollaboratorAvatar key={c.id} collaborator={c} />
      ))}
      {overflow > 0 && (
        <AvatarGroupCount aria-label={`${overflow} more`}>
          +{overflow}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}

function CollaboratorAvatar({ collaborator }: { collaborator: Collaborator }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`View ${collaborator.name}`}
          className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
        >
          <Avatar
            title={collaborator.name}
            className={cn(
              "h-8 w-8 ring-2 ring-[#18181C]",
              "transition-transform duration-150 ease-out hover:scale-110",
            )}
          >
            {collaborator.imageUrl ? (
              <AvatarImage src={collaborator.imageUrl} alt={collaborator.name} />
            ) : null}
            <AvatarFallback
              style={{ backgroundColor: collaborator.color }}
              className="text-[10px] font-semibold text-white"
            >
              {getInitials(collaborator.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className={cn(
          "w-auto min-w-[180px] rounded-2xl border border-[#2E2E36] bg-[#18181C]/95",
          "backdrop-blur-md p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.55)]",
        )}
      >
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 ring-2 ring-[#18181C]">
            {collaborator.imageUrl ? (
              <AvatarImage src={collaborator.imageUrl} alt={collaborator.name} />
            ) : null}
            <AvatarFallback
              style={{ backgroundColor: collaborator.color }}
              className="text-xs font-semibold text-white"
            >
              {getInitials(collaborator.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-[#F3F4F6] truncate">
              {collaborator.name}
            </span>
            <span className="text-[11px] text-[#9CA3AF]">Active now</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
