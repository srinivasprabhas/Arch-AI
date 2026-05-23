"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { ProjectData } from "@/lib/projects"

export type { ProjectData as Project }

export type DialogType = "create" | "rename" | "delete" | null

export interface ProjectDialogsContextValue {
  ownedProjects: ProjectData[]
  sharedProjects: ProjectData[]
  dialogType: DialogType
  activeProject: ProjectData | null
  nameInput: string
  roomIdPreview: string
  isLoading: boolean
  openCreate: () => void
  openRename: (project: ProjectData) => void
  openDelete: (project: ProjectData) => void
  closeDialog: () => void
  setNameInput: (name: string) => void
  handleSubmit: () => void
}

export const ProjectDialogsContext = createContext<ProjectDialogsContextValue | null>(null)

export function useProjectDialogsContext(): ProjectDialogsContextValue {
  const ctx = useContext(ProjectDialogsContext)
  if (!ctx) throw new Error("useProjectDialogsContext must be used inside ProjectDialogsContext.Provider")
  return ctx
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 7)
}

function listKey(list: ProjectData[]): string {
  return list.map((p) => `${p.id}:${p.name}`).join("|")
}

interface UseProjectDialogsOptions {
  ownedProjects: ProjectData[]
  sharedProjects: ProjectData[]
}

export function useProjectDialogs({
  ownedProjects: initialOwned,
  sharedProjects: initialShared,
}: UseProjectDialogsOptions): ProjectDialogsContextValue {
  const router = useRouter()
  const pathname = usePathname()

  const [ownedProjects, setOwnedProjects] = useState<ProjectData[]>(initialOwned)
  const [sharedProjects, setSharedProjects] = useState<ProjectData[]>(initialShared)
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null)
  const [nameInput, setNameInputState] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suffix] = useState(shortSuffix)

  // After router.refresh() the layout re-renders on the server and passes new props.
  // useState does not re-initialize from props, so we sync here when the content changes.
  const prevOwnedKey = useRef(listKey(initialOwned))
  useEffect(() => {
    const key = listKey(initialOwned)
    if (key !== prevOwnedKey.current) {
      prevOwnedKey.current = key
      setOwnedProjects(initialOwned)
    }
  }, [initialOwned])

  const prevSharedKey = useRef(listKey(initialShared))
  useEffect(() => {
    const key = listKey(initialShared)
    if (key !== prevSharedKey.current) {
      prevSharedKey.current = key
      setSharedProjects(initialShared)
    }
  }, [initialShared])

  const slug = toSlug(nameInput)
  const roomIdPreview = slug ? `${slug}-${suffix}` : ""

  const openCreate = useCallback(() => {
    setNameInputState("")
    setActiveProject(null)
    setDialogType("create")
  }, [])

  // Store target project id + current name
  const openRename = useCallback((project: ProjectData) => {
    setNameInputState(project.name)
    setActiveProject(project)
    setDialogType("rename")
  }, [])

  // Store target project
  const openDelete = useCallback((project: ProjectData) => {
    setActiveProject(project)
    setDialogType("delete")
  }, [])

  const closeDialog = useCallback(() => {
    setDialogType(null)
    setActiveProject(null)
    setNameInputState("")
  }, [])

  const setNameInput = useCallback((name: string) => {
    setNameInputState(name)
  }, [])

  const handleSubmit = useCallback(async () => {
    setIsLoading(true)
    try {
      if (dialogType === "create" && nameInput.trim()) {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nameInput.trim() }),
        })
        if (res.ok) {
          const project: { id: string; name: string; updatedAt?: string } =
            await res.json()
          setOwnedProjects((prev) => [
            {
              id: project.id,
              name: project.name,
              isOwned: true,
              updatedAt: project.updatedAt ?? new Date().toISOString(),
            },
            ...prev,
          ])
          closeDialog()
          // project.id is used as the LiveBlocks room id (kept aligned)
          router.push(`/editor/${project.id}`)
        }
      } else if (dialogType === "rename" && activeProject && nameInput.trim()) {
        // Call PATCH /api/projects/[id]; refresh on success
        const res = await fetch(`/api/projects/${activeProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nameInput.trim() }),
        })
        if (res.ok) {
          closeDialog()
          router.refresh()
        }
      } else if (dialogType === "delete" && activeProject) {
        // Call DELETE /api/projects/[id]
        const targetId = activeProject.id
        const isActiveWorkspace = pathname === `/editor/${targetId}`
        const res = await fetch(`/api/projects/${targetId}`, {
          method: "DELETE",
        })
        if (res.ok) {
          // Remove from sidebar immediately on confirmed delete, then sync server state
          setOwnedProjects((prev) => prev.filter((p) => p.id !== targetId))
          closeDialog()
          // Redirect to /editor if deleting the active workspace, otherwise refresh
          if (isActiveWorkspace) {
            router.push("/editor")
          } else {
            router.refresh()
          }
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [dialogType, nameInput, activeProject, suffix, closeDialog, router, pathname])

  return {
    ownedProjects,
    sharedProjects,
    dialogType,
    activeProject,
    nameInput,
    roomIdPreview,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    setNameInput,
    handleSubmit,
  }
}
