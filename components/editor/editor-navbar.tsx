"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  Check,
  Copy,
  ImageDown,
  LayoutTemplate,
  Loader2,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Share2,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { UserButton } from "@clerk/nextjs"

import { CollaboratorAvatars } from "@/components/editor/collaborator-avatars"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspace } from "@/hooks/use-workspace"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"
import { cn } from "@/lib/utils"

const FLOATING_GROUP =
  "flex items-center rounded-xl border border-[#2E2E36] bg-[#18181C]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)]"

const ICON_BUTTON =
  "inline-flex h-8 w-8 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors duration-150 ease-out hover:text-[#F3F4F6] hover:bg-[#23232A]"

const TEXT_BUTTON =
  "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm text-[#9CA3AF] transition-colors duration-150 ease-out hover:text-[#F3F4F6] hover:bg-[#23232A]"

export function EditorNavbar() {
  const {
    project,
    isProjectSidebarOpen,
    toggleProjectSidebar,
    isAiSidebarOpen,
    toggleAiSidebar,
    openShareDialog,
    openStarterTemplates,
    canvasSaveStatus,
    setProject,
  } = useWorkspace()

  return (
    <div
      aria-label="Editor toolbar"
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-4 pt-4"
    >
      <div className="pointer-events-auto flex items-center gap-2">
        <div className={FLOATING_GROUP}>
          <button
            type="button"
            onClick={toggleProjectSidebar}
            aria-label={isProjectSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
            className={ICON_BUTTON}
          >
            {isProjectSidebarOpen ? (
              <PanelRightOpen className="h-5 w-5" />
            ) : (
              <PanelRightClose className="h-5 w-5" />
            )}
          </button>

          {project && (
            <ProjectMenu
              projectId={project.id}
              openShareDialog={openShareDialog}
              onRenameRequest={() => focusProjectTitle()}
            />
          )}
        </div>

        {project && (
          <div className={cn(FLOATING_GROUP, "px-3 py-1.5 gap-2")}>
            <ProjectTitle
              projectId={project.id}
              name={project.name}
              onUpdate={(name) => setProject({ ...project, name })}
            />
            <SaveStatusIcon status={canvasSaveStatus} />
          </div>
        )}
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        {project && (
          <>
            <div className={cn(FLOATING_GROUP, "px-2 py-1")}>
              <CollaboratorAvatars />
            </div>

            <div className={cn(FLOATING_GROUP, "px-1 py-1 gap-0.5")}>
              <button
                type="button"
                onClick={openStarterTemplates}
                aria-label="Open starter templates"
                className={TEXT_BUTTON}
              >
                <LayoutTemplate className="h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </button>
              <button
                type="button"
                onClick={openShareDialog}
                aria-label="Share project"
                className={TEXT_BUTTON}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                type="button"
                onClick={toggleAiSidebar}
                aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
                aria-pressed={isAiSidebarOpen}
                className={cn(
                  ICON_BUTTON,
                  isAiSidebarOpen &&
                    "text-[#A78BFA] bg-[#8B5CF6]/15 shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:text-[#A78BFA] hover:bg-[#8B5CF6]/20",
                )}
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </div>
          </>
        )}

        <div className={cn(FLOATING_GROUP, "px-1.5 py-1")}>
          <UserButton />
        </div>
      </div>
    </div>
  )
}

const PROJECT_TITLE_FOCUS_EVENT = "arch-ai:focus-project-title"

function focusProjectTitle() {
  window.dispatchEvent(new CustomEvent(PROJECT_TITLE_FOCUS_EVENT))
}

function ProjectTitle({
  projectId,
  name,
  onUpdate,
}: {
  projectId: string
  name: string
  onUpdate: (name: string) => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  useEffect(() => {
    if (!editing) setDraft(name)
  }, [name, editing])

  const beginEditing = useCallback(() => {
    setEditing(true)
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      el.focus()
      el.select()
    })
  }, [])

  useEffect(() => {
    const handler = () => beginEditing()
    window.addEventListener(PROJECT_TITLE_FOCUS_EVENT, handler)
    return () => window.removeEventListener(PROJECT_TITLE_FOCUS_EVENT, handler)
  }, [beginEditing])

  const commit = useCallback(async () => {
    const trimmed = draft.trim()
    setEditing(false)
    if (!trimmed || trimmed === name) {
      setDraft(name)
      return
    }
    onUpdate(trimmed)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error(`Rename failed (${res.status})`)
      router.refresh()
    } catch (err) {
      console.error("Project rename failed", err)
      onUpdate(name)
      setDraft(name)
    }
  }, [draft, name, onUpdate, projectId, router])

  return (
    <div className="relative flex items-center min-w-0">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void commit()
            } else if (e.key === "Escape") {
              e.preventDefault()
              setDraft(name)
              setEditing(false)
            }
          }}
          aria-label="Project name"
          className={cn(
            "border-none outline-none bg-transparent underline",
            "text-sm font-medium text-[#F3F4F6] truncate max-w-[16rem] min-w-[6rem]",
          )}
        />
      ) : (
        <button
          type="button"
          onClick={beginEditing}
          title={name}
          className={cn(
            "text-sm font-medium truncate max-w-[16rem]",
            "text-[#F3F4F6] transition-colors duration-150 ease-out",
            "hover:text-[#8B5CF6] hover:underline underline-offset-2",
          )}
        >
          {name}
        </button>
      )}
    </div>
  )
}

function ProjectMenu({
  projectId,
  openShareDialog,
  onRenameRequest,
}: {
  projectId: string
  openShareDialog: () => void
  onRenameRequest: () => void
}) {
  const handleCopyRoomId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(projectId)
    } catch (err) {
      console.error("Copy room id failed", err)
    }
  }, [projectId])

  const handleExportImage = useCallback(() => {
    console.info("Export image — not implemented yet")
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open editor menu"
          className={ICON_BUTTON}
        >
          <Menu className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className={cn(
          "min-w-[180px] rounded-2xl border border-[#2E2E36] bg-[#18181C]/95 backdrop-blur-md",
          "p-1.5 text-[#F3F4F6] shadow-[0_12px_32px_rgba(0,0,0,0.55)]",
        )}
      >
        <MenuItemRow
          icon={<Pencil className="h-4 w-4" />}
          label="Rename Scene"
          onSelect={onRenameRequest}
        />
        <MenuItemRow
          icon={<Copy className="h-4 w-4" />}
          label="Copy Room ID"
          onSelect={() => void handleCopyRoomId()}
        />
        <MenuItemRow
          icon={<ImageDown className="h-4 w-4" />}
          label="Export Image"
          onSelect={handleExportImage}
        />
        <MenuItemRow
          icon={<Share2 className="h-4 w-4" />}
          label="Share"
          onSelect={openShareDialog}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MenuItemRow({
  icon,
  label,
  onSelect,
}: {
  icon: React.ReactNode
  label: string
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault()
        onSelect()
      }}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm cursor-pointer",
        "text-[#F3F4F6] focus:bg-[#23232A] focus:text-[#F3F4F6]",
        "transition-colors duration-150 ease-out",
      )}
    >
      <span className="text-[#9CA3AF]">{icon}</span>
      {label}
    </DropdownMenuItem>
  )
}

function SaveStatusIcon({ status }: { status: CanvasSaveStatus }) {
  if (status === "idle") return null

  if (status === "saving") {
    return (
      <span
        title="Saving"
        aria-label="Saving"
        className="inline-flex h-5 w-5 items-center justify-center text-[#9CA3AF]"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </span>
    )
  }

  if (status === "saved") {
    return (
      <span
        title="Saved"
        aria-label="Saved"
        className="inline-flex h-5 w-5 items-center justify-center text-[#9CA3AF]"
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    )
  }

  return (
    <span
      title="Sync failed"
      aria-label="Sync failed"
      className="inline-flex h-5 w-5 items-center justify-center text-[#EF4444]"
    >
      <AlertTriangle className="h-3.5 w-3.5" />
    </span>
  )
}
