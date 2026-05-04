"use client"

import { FolderOpen, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

function EmptyPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <FolderOpen className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">No {label} yet</p>
    </div>
  )
}

export function ProjectSidebar({ isOpen, onClose, className }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "absolute inset-y-0 left-0 z-20 w-72 flex flex-col",
        "bg-surface border-r border-surface-border",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-surface-border shrink-0">
        <span className="text-sm font-semibold text-copy-primary">Projects</span>
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="p-1 rounded-xl text-copy-muted hover:text-copy-primary hover:bg-elevated transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Tabs defaultValue="my-projects" className="flex flex-col flex-1 min-h-0">
        <TabsList className="mx-4 mt-3 bg-elevated shrink-0">
          <TabsTrigger value="my-projects" className="flex-1 text-xs">
            My Projects
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex-1 text-xs">
            Shared
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-projects" className="flex-1 overflow-y-auto px-4 mt-0">
          <EmptyPlaceholder label="projects" />
        </TabsContent>

        <TabsContent value="shared" className="flex-1 overflow-y-auto px-4 mt-0">
          <EmptyPlaceholder label="shared projects" />
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-surface-border shrink-0">
        <Button
          variant="outline"
          className="w-full gap-2 border-surface-border text-copy-primary hover:bg-elevated"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
