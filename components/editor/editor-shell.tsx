"use client"

import { useCallback, useState } from "react"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { PanelRightClose, PanelRightOpen } from "lucide-react"

import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectDialogsContext, useProjectDialogs } from "@/hooks/use-project-dialogs"
import { WorkspaceContext, type WorkspaceProject } from "@/hooks/use-workspace"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"
import type { ProjectData } from "@/lib/projects"
import { cn } from "@/lib/utils"

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
  const [isStarterTemplatesOpen, setIsStarterTemplatesOpen] = useState(false)
  const [canvasSaveStatus, setCanvasSaveStatus] = useState<CanvasSaveStatus>("idle")
  const dialogState = useProjectDialogs({ ownedProjects, sharedProjects })

  const pathname = usePathname() ?? ""
  const isInWorkspace =
    pathname.startsWith("/editor/") && pathname !== "/editor"

  const setProject = useCallback((project: WorkspaceProject | null) => {
    setWorkspaceProject(project)
  }, [])

  const toggleAiSidebar = useCallback(() => {
    setIsAiSidebarOpen((o) => !o)
  }, [])

  const toggleProjectSidebar = useCallback(() => {
    setSidebarOpen((o) => !o)
  }, [])

  const openShareDialog = useCallback(() => setIsShareDialogOpen(true), [])
  const closeShareDialog = useCallback(() => setIsShareDialogOpen(false), [])
  const openStarterTemplates = useCallback(() => setIsStarterTemplatesOpen(true), [])
  const closeStarterTemplates = useCallback(() => setIsStarterTemplatesOpen(false), [])

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
          isProjectSidebarOpen: sidebarOpen,
          toggleProjectSidebar,
          isStarterTemplatesOpen,
          openStarterTemplates,
          closeStarterTemplates,
          canvasSaveStatus,
          setCanvasSaveStatus,
        }}
      >
        <div className="flex flex-col h-full bg-base">
          <div className="relative flex-1 min-h-0">
            {sidebarOpen && (
              <div
                className={cn(
                  "absolute inset-0 z-10 bg-black/50 md:hidden",
                  "transition-opacity duration-150 ease-out",
                )}
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            <ProjectSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {!isInWorkspace && (
              <HomeFloatingChrome
                isSidebarOpen={sidebarOpen}
                onToggleSidebar={toggleProjectSidebar}
              />
            )}

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

const HOME_PROJECT_SIDEBAR_WIDTH = 288

function HomeFloatingChrome({
  isSidebarOpen,
  onToggleSidebar,
}: {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}) {
  const leftSlideStyle = {
    transform: `translateX(${isSidebarOpen ? HOME_PROJECT_SIDEBAR_WIDTH : 0}px)`,
    transition: "transform 300ms ease-in-out",
  } as const

  return (
    <div
      aria-label="Editor toolbar"
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-4 pt-4"
    >
      <div
        className="pointer-events-auto flex items-center rounded-xl border border-[#2E2E36] bg-[#18181C]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        style={leftSlideStyle}
      >
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors duration-150 ease-out hover:text-[#F3F4F6] hover:bg-[#23232A]"
        >
          {isSidebarOpen ? (
            <PanelRightOpen className="h-5 w-5" />
          ) : (
            <PanelRightClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="pointer-events-auto flex items-center rounded-xl border border-[#2E2E36] bg-[#18181C]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)] px-1.5 py-1">
        <UserButton />
      </div>
    </div>
  )
}
