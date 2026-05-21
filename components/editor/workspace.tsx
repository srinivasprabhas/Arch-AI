"use client"

import { useEffect } from "react"
import { useWorkspace, type WorkspaceProject } from "@/hooks/use-workspace"
import { AiSidebar } from "@/components/editor/ai-sidebar"
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

  return (
    <div className="relative h-full w-full overflow-hidden bg-base">
      <CanvasRoom roomId={project.id}>
        <AiSidebar isOpen={isAiSidebarOpen} onClose={toggleAiSidebar} />
      </CanvasRoom>
      <ShareDialog />
    </div>
  )
}
