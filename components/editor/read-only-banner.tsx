"use client"

import { Eye } from "lucide-react"

import { cn } from "@/lib/utils"

export function ReadOnlyBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-40",
        "flex items-center gap-2 rounded-xl border border-[#2E2E36]",
        "bg-[#18181C]/90 backdrop-blur-md px-3 py-1.5",
        "shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
      )}
    >
      <Eye className="h-3.5 w-3.5 text-[#A78BFA]" />
      <span className="text-xs font-medium text-[#F3F4F6]">
        View only
      </span>
      <span className="text-[11px] text-[#9CA3AF]">
        Only invited members can edit and collaborate.
      </span>
    </div>
  )
}
