"use client"

import { useCallback, useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectDialogsContext, useProjectDialogs } from "@/hooks/use-project-dialogs"
import { WorkspaceContext, type WorkspaceProject } from "@/hooks/use-workspace"
import type { ProjectData } from "@/lib/projects"

interface EditorShellProps {
  children: React.ReactNode
  ownedProjects: ProjectData[]
  sharedProjects: ProjectData[]
}

export function EditorShell({ children, ownedProjects, sharedProjects }: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workspaceProject, setWorkspaceProject] = useState<WorkspaceProject | null>(null)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const dialogState = useProjectDialogs({ ownedProjects, sharedProjects })

  const setProject = useCallback((project: WorkspaceProject | null) => {
    setWorkspaceProject(project)
  }, [])

  const toggleAiSidebar = useCallback(() => {
    setIsAiSidebarOpen((o) => !o)
  }, [])

  const openShareDialog = useCallback(() => setIsShareDialogOpen(true), [])
  const closeShareDialog = useCallback(() => setIsShareDialogOpen(false), [])

  return (
    <ProjectDialogsContext.Provider value={dialogState}>
      <WorkspaceContext.Provider
        value={{
          project: workspaceProject,
          setProject,
          isAiSidebarOpen,
          toggleAiSidebar,
          isShareDialogOpen,
          openShareDialog,
          closeShareDialog,
        }}
      >
        <div className="flex flex-col h-full bg-base">
          <EditorNavbar
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
          />

          <div className="relative flex-1 min-h-0">
            {sidebarOpen && (
              <div
                className="absolute inset-0 z-10 bg-black/50 md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            <ProjectSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            <main className="h-full overflow-hidden">
              {children}
            </main>
          </div>
        </div>

        <ProjectDialogs />
      </WorkspaceContext.Provider>
    </ProjectDialogsContext.Provider>
  )
}
