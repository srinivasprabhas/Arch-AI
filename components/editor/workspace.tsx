"use client"

import { useEffect } from "react"
import { Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspace, type WorkspaceProject } from "@/hooks/use-workspace"
import { ShareDialog } from "@/components/editor/share-dialog"

interface WorkspaceProps {
  project: WorkspaceProject
}

export function Workspace({ project }: WorkspaceProps) {
  const { setProject, isAiSidebarOpen, toggleAiSidebar } = useWorkspace()

  useEffect(() => {
    setProject(project)
    return () => setProject(null)
  }, [project, setProject])

  return (
    <div className="relative h-full w-full overflow-hidden bg-base">
      <CanvasPlaceholder />
      <AiSidebar isOpen={isAiSidebarOpen} onClose={toggleAiSidebar} />
      <ShareDialog />
    </div>
  )
}

function CanvasPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center max-w-md px-6">
        <p className="text-sm text-copy-muted">
          Canvas coming soon
        </p>
        <p className="text-xs text-copy-faint">
          Real-time architecture design will appear here.
        </p>
      </div>
    </div>
  )
}

function AiSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <aside
      aria-label="AI chat sidebar"
      className={cn(
        "absolute inset-y-0 right-0 z-20 w-80 flex flex-col",
        "bg-surface border-l border-surface-border",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-surface-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-ai-text" />
          <span className="text-sm font-semibold text-copy-primary">AI</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI sidebar"
          className="p-1 rounded-xl text-copy-muted hover:text-copy-primary hover:bg-elevated transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-xs text-copy-faint text-center">
          AI chat coming soon.
        </p>
      </div>
    </aside>
  )
}
