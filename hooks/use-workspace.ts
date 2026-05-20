"use client"

import { createContext, useContext } from "react"

export interface WorkspaceProject {
  id: string
  name: string
}

export interface WorkspaceContextValue {
  project: WorkspaceProject | null
  setProject: (project: WorkspaceProject | null) => void
  isAiSidebarOpen: boolean
  toggleAiSidebar: () => void
  isShareDialogOpen: boolean
  openShareDialog: () => void
  closeShareDialog: () => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceContext.Provider")
  return ctx
}
