"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar, className }: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "h-12 flex items-center px-3 bg-surface border-b border-surface-border shrink-0",
        className
      )}
    >
      <div className="flex items-center">
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

      <div className="flex-1" />

      <div className="flex items-center" />
    </header>
  )
}
