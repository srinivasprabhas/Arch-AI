"use client"

import { ChevronsUp, X } from "lucide-react"
import { Panel } from "@xyflow/react"

import { cn } from "@/lib/utils"

interface MiniMapToggleProps {
  visible: boolean
  onToggle: () => void
  rightOffset: number
}

const MINIMAP_HEIGHT = 110

export function MiniMapToggle({
  visible,
  onToggle,
  rightOffset,
}: MiniMapToggleProps) {
  if (visible) {
    return (
      <Panel
        position="bottom-right"
        style={{
          marginRight: rightOffset,
          marginBottom: 16 + MINIMAP_HEIGHT + 4,
          pointerEvents: "auto",
          transition: "margin-right 300ms ease-in-out",
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-label="Hide minimap"
          title="Hide minimap"
          className={cn(
            "grid h-6 w-6 place-items-center rounded-md",
            "bg-[#18181C]/85 backdrop-blur-md border border-[#2E2E36]",
            "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#23232A]",
            "transition-colors duration-150 ease-out",
            "shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
          )}
        >
          <X className="h-3 w-3" />
        </button>
      </Panel>
    )
  }

  return (
    <Panel
      position="bottom-right"
      style={{
        marginRight: rightOffset,
        pointerEvents: "auto",
        transition: "margin-right 300ms ease-in-out",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label="Show minimap"
        title="Show minimap"
        className={cn(
          "group grid h-7 w-7 place-items-center rounded-lg",
          "bg-[#18181C]/40 backdrop-blur-sm border border-[#2E2E36]/40",
          "text-[#9CA3AF]/40",
          "hover:bg-[#18181C]/95 hover:border-[#8B5CF6]/60 hover:text-[#A78BFA]",
          "hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]",
          "transition-all duration-150 ease-out",
        )}
      >
        <ChevronsUp className="h-3.5 w-3.5" />
      </button>
    </Panel>
  )
}
