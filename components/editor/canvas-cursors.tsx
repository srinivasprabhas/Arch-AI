"use client"

import { useMemo } from "react"
import { ViewportPortal } from "@xyflow/react"
import { useOthers } from "@liveblocks/react/suspense"
import { useUser } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

interface CursorEntry {
  connectionId: number
  x: number
  y: number
  name: string
  color: string
  thinking: boolean
}

export function CanvasCursors() {
  const others = useOthers()
  const { user } = useUser()
  const currentUserId = user?.id

  const cursors = useMemo<CursorEntry[]>(() => {
    const list: CursorEntry[] = []
    for (const other of others) {
      if (other.id && other.id === currentUserId) continue
      const cursor = other.presence?.cursor
      if (!cursor) continue
      list.push({
        connectionId: other.connectionId,
        x: cursor.x,
        y: cursor.y,
        name: other.info?.name ?? "Collaborator",
        color: other.info?.color ?? "#94A3B8",
        thinking: other.presence?.thinking === true,
      })
    }
    return list
  }, [others, currentUserId])

  if (cursors.length === 0) return null

  return (
    <ViewportPortal>
      {cursors.map((cursor) => (
        <RemoteCursor key={cursor.connectionId} cursor={cursor} />
      ))}
    </ViewportPortal>
  )
}

function RemoteCursor({ cursor }: { cursor: CursorEntry }) {
  return (
    <div
      className="pointer-events-none absolute select-none"
      style={{
        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
        left: 0,
        top: 0,
      }}
      aria-hidden
    >
      <svg
        width="18"
        height="22"
        viewBox="0 0 18 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
      >
        <path
          d="M2 2 L2 17 L6.5 13.5 L9.2 19.5 L11.8 18.4 L9.1 12.6 L15 12 Z"
          fill={cursor.color}
          stroke="#0b0b0c"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="ml-3 -mt-1 inline-flex max-w-[160px] items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight text-white shadow-sm"
        style={{ backgroundColor: cursor.color }}
      >
        <span className="truncate">{cursor.name}</span>
        {cursor.thinking && (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden />
        )}
      </div>
    </div>
  )
}
