"use client"

import { CanvasPreview } from "@/components/dashboard/canvas-preview"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { cn } from "@/lib/utils"

interface TemplateCardProps {
  template: CanvasTemplate
  className?: string
}

export function TemplateCard({ template, className }: TemplateCardProps) {
  return (
    <div
      title={template.description}
      className={cn(
        "flex flex-col gap-2 shrink-0 w-[240px]",
        className,
      )}
    >
      <div
        className={cn(
          "aspect-[16/9] overflow-hidden rounded-xl border border-[#2E2E36] bg-[#18181C]",
          "transition-colors duration-150 ease-out",
        )}
      >
        <CanvasPreview nodes={template.nodes} edges={template.edges} />
      </div>
      <span className="px-1 text-sm font-medium text-[#F3F4F6] truncate">
        {template.name}
      </span>
    </div>
  )
}
