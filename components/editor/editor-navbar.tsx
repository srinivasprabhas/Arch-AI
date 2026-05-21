"use client"

import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/hooks/use-workspace"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar, className }: EditorNavbarProps) {
  const { project, isAiSidebarOpen, toggleAiSidebar, openShareDialog } = useWorkspace()

  return (
    <header
      className={cn(
        "h-12 flex items-center px-3 gap-3 bg-surface border-b border-surface-border shrink-0",
        className
      )}
    >
      <div className="flex items-center shrink-0">
        <button
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="p-1.5 rounded-xl text-copy-muted hover:text-copy-primary hover:bg-elevated transition-colors"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>
      </div>

      {project && (
        <div className="flex-1 min-w-0 flex items-center">
          <span className="text-sm font-medium text-copy-primary truncate" title={project.name}>
            {project.name}
          </span>
        </div>
      )}

      {!project && <div className="flex-1" />}

      <div className="flex items-center gap-1 shrink-0">
        {project && (
          <>
            <button
              type="button"
              onClick={openShareDialog}
              aria-label="Share project"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm text-copy-secondary hover:text-copy-primary hover:bg-elevated transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={toggleAiSidebar}
              aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
              aria-pressed={isAiSidebarOpen}
              className={cn(
                "p-1.5 rounded-xl transition-colors",
                isAiSidebarOpen
                  ? "bg-accent-dim text-ai-text"
                  : "text-copy-muted hover:text-copy-primary hover:bg-elevated"
              )}
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </>
        )}
        <UserButton />
      </div>
    </header>
  )
}
