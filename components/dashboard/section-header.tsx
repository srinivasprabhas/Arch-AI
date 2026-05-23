import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  description?: string
  className?: string
}

export function SectionHeader({ title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ color: "#8B5CF6" }}
      >
        {title}
      </h2>
      {description && (
        <p className="text-xs text-[#9CA3AF]">{description}</p>
      )}
    </div>
  )
}

export function SectionDivider() {
  return <hr className="border-t border-[#2E2E36] opacity-60" />
}
