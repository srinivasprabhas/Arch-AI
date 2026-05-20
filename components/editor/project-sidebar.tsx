"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FolderOpen, Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { type Project, useProjectDialogsContext } from "@/hooks/use-project-dialogs"

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

function ProjectItem({ project, isActive }: { project: Project; isActive: boolean }) {
  const { openRename, openDelete } = useProjectDialogsContext()

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-2 rounded-xl transition-colors",
        isActive ? "bg-elevated" : "hover:bg-elevated"
      )}
    >
      <Link
        href={`/editor/${project.id}`}
        className={cn(
          "flex-1 min-w-0 text-sm truncate",
          isActive ? "text-copy-primary font-medium" : "text-copy-primary"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {project.name}
      </Link>
      {project.isOwned && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); openRename(project) }}
            aria-label={`Rename ${project.name}`}
            className="p-1 rounded-lg text-copy-muted hover:text-copy-primary hover:bg-subtle transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDelete(project) }}
            aria-label={`Delete ${project.name}`}
            className="p-1 rounded-lg text-copy-muted hover:text-error hover:bg-subtle transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export function ProjectSidebar({ isOpen, onClose, className }: ProjectSidebarProps) {
  const { ownedProjects, sharedProjects, openCreate } = useProjectDialogsContext()
  const pathname = usePathname()
  const activeId = pathname.startsWith("/editor/") ? pathname.slice("/editor/".length) : null

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

        <TabsContent value="my-projects" className="flex-1 overflow-y-auto px-2 mt-2">
          {ownedProjects.length === 0 ? (
            <EmptyPlaceholder label="projects" />
          ) : (
            <div className="flex flex-col gap-0.5 py-1">
              {ownedProjects.map((p) => (
                <ProjectItem key={p.id} project={p} isActive={p.id === activeId} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shared" className="flex-1 overflow-y-auto px-2 mt-2">
          {sharedProjects.length === 0 ? (
            <EmptyPlaceholder label="shared projects" />
          ) : (
            <div className="flex flex-col gap-0.5 py-1">
              {sharedProjects.map((p) => (
                <ProjectItem key={p.id} project={p} isActive={p.id === activeId} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-surface-border shrink-0">
        <Button
          variant="outline"
          onClick={openCreate}
          className="w-full gap-2 border-surface-border text-copy-primary hover:bg-elevated"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
