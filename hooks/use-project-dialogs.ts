"use client"

import { createContext, useCallback, useContext, useState } from "react"

export interface Project {
  id: string
  name: string
  slug: string
  isOwned: boolean
}

export type DialogType = "create" | "rename" | "delete" | null

export interface ProjectDialogsContextValue {
  projects: Project[]
  dialogType: DialogType
  activeProject: Project | null
  nameInput: string
  slugPreview: string
  isLoading: boolean
  openCreate: () => void
  openRename: (project: Project) => void
  openDelete: (project: Project) => void
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

const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Cloud Architecture", slug: "cloud-architecture", isOwned: true },
  { id: "2", name: "Microservices Design", slug: "microservices-design", isOwned: true },
  { id: "3", name: "Team Infrastructure", slug: "team-infrastructure", isOwned: false },
]

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function useProjectDialogs(): ProjectDialogsContextValue {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [nameInput, setNameInputState] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const slugPreview = toSlug(nameInput)

  const openCreate = useCallback(() => {
    setNameInputState("")
    setActiveProject(null)
    setDialogType("create")
  }, [])

  const openRename = useCallback((project: Project) => {
    setNameInputState(project.name)
    setActiveProject(project)
    setDialogType("rename")
  }, [])

  const openDelete = useCallback((project: Project) => {
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

  const handleSubmit = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      const slug = toSlug(nameInput)
      if (dialogType === "create" && nameInput.trim() && slug) {
        setProjects((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            name: nameInput.trim(),
            slug,
            isOwned: true,
          },
        ])      } else if (dialogType === "rename" && activeProject && nameInput.trim()) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === activeProject.id
              ? { ...p, name: nameInput.trim(), slug: toSlug(nameInput) }
              : p
          )
        )
      } else if (dialogType === "delete" && activeProject) {
        setProjects((prev) => prev.filter((p) => p.id !== activeProject.id))
      }
      setIsLoading(false)
      closeDialog()
    }, 300)
  }, [dialogType, nameInput, activeProject, closeDialog])

  return {
    projects,
    dialogType,
    activeProject,
    nameInput,
    slugPreview,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    setNameInput,
    handleSubmit,
  }
}
