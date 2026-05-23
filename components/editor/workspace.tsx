"use client"

import { useEffect } from "react"
import { useWorkspace, type WorkspaceProject } from "@/hooks/use-workspace"
import { AiSidebar } from "@/components/editor/ai-sidebar"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ReadOnlyBanner } from "@/components/editor/read-only-banner"
import { ShareDialog } from "@/components/editor/share-dialog"
import { CanvasRoom } from "@/components/editor/canvas-room"

interface WorkspaceProps {
  project: WorkspaceProject
}

export function Workspace({ project }: WorkspaceProps) {
  const { setProject, isAiSidebarOpen, toggleAiSidebar } = useWorkspace()

  useEffect(() => {
    setProject(project)
    return () => setProject(null)
  }, [project, setProject])

  const isViewer = project.role === "viewer"

  return (
    <div className="relative h-full w-full overflow-hidden bg-base">
      <CanvasRoom roomId={project.id}>
        <EditorNavbar />
        {isViewer && <ReadOnlyBanner />}
        {!isViewer && (
          <AiSidebar isOpen={isAiSidebarOpen} onClose={toggleAiSidebar} />
        )}
      </CanvasRoom>
      {!isViewer && <ShareDialog />}
    </div>
  )
}
