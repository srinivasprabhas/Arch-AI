"use client"

import {
  Check,
  CloudOff,
  LayoutTemplate,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/hooks/use-workspace"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar, className }: EditorNavbarProps) {
  const {
    project,
    isAiSidebarOpen,
    toggleAiSidebar,
    openShareDialog,
    openStarterTemplates,
    canvasSaveStatus,
  } = useWorkspace()

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
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-medium text-copy-primary truncate" title={project.name}>
            {project.name}
          </span>
          <span
            className="font-mono text-xs text-copy-muted truncate"
            title={`Room ID: ${project.id}`}
          >
            {project.id}
          </span>
          <SaveStatusIndicator status={canvasSaveStatus} />
        </div>
      )}

      {!project && <div className="flex-1" />}

      <div className="flex items-center gap-1 shrink-0">
        {project && (
          <>
            <button
              type="button"
              onClick={openStarterTemplates}
              aria-label="Open starter templates"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm text-copy-secondary hover:text-copy-primary hover:bg-elevated transition-colors"
            >
              <LayoutTemplate className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </button>
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

function SaveStatusIndicator({ status }: { status: CanvasSaveStatus }) {
  if (status === "idle") return null

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-xs text-copy-muted">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    )
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-xs text-copy-muted">
        <Check className="h-3 w-3" />
        Saved
      </span>
    )
  }

  return (
    <span
      className="flex items-center gap-1 rounded-full bg-elevated px-2 py-0.5 text-xs text-error"
      title="Couldn't save the canvas. We'll try again on the next change."
    >
      <CloudOff className="h-3 w-3" />
      Save failed
    </span>
  )
}
