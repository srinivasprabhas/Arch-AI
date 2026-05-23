"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Copy,
  ImageDown,
  Loader2,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react"

import { CanvasPreview } from "@/components/dashboard/canvas-preview"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ShareDialogInner } from "@/components/editor/share-dialog"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  projectId: string
  name: string
  /**
   * Server-provided `updatedAt` timestamp. Used as a fetch-effect dep so
   * the card re-fetches its canvas preview whenever the server reports a
   * newer version (e.g. after the user autosaved in the editor). Without
   * this, navigating away + back to the dashboard shows a stale preview
   * because React reuses the card instance and the projectId-only effect
   * doesn't re-fire.
   */
  updatedAt: string
  className?: string
}

interface CanvasPayload {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

export function ProjectCard({
  projectId,
  name,
  updatedAt,
  className,
}: ProjectCardProps) {
  const router = useRouter()
  const [canvas, setCanvas] = useState<CanvasPayload | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  )
  const [currentName, setCurrentName] = useState(name)

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameDraft, setRenameDraft] = useState(name)
  const [renaming, setRenaming] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    setCurrentName(name)
  }, [name])

  // Canvas preview fetch. Deps include `updatedAt` so the card refetches
  // whenever the project's server-side timestamp moves forward — which it
  // does on every autosave (Prisma's `@updatedAt` bumps on every Project
  // row mutation, including the canvasJsonPath swap in the PUT route).
  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    void (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Canvas load failed (${res.status})`)
        const data = (await res.json()) as { canvas: CanvasPayload | null }
        if (cancelled) return
        if (!data.canvas) {
          setCanvas(null)
          setStatus("empty")
          return
        }
        setCanvas(data.canvas)
        setStatus("ready")
      } catch (err) {
        if (cancelled) return
        console.error("ProjectCard canvas load failed", err)
        setStatus("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [projectId, updatedAt])


  const openRename = useCallback(() => {
    setRenameDraft(currentName)
    setRenameError(null)
    setRenameOpen(true)
  }, [currentName])

  const commitRename = useCallback(async () => {
    const trimmed = renameDraft.trim()
    if (!trimmed) {
      setRenameError("Name can't be empty.")
      return
    }
    if (trimmed === currentName) {
      setRenameOpen(false)
      return
    }
    setRenaming(true)
    setRenameError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error(`Rename failed (${res.status})`)
      setCurrentName(trimmed)
      setRenameOpen(false)
      router.refresh()
    } catch (err) {
      console.error("Project rename failed", err)
      setRenameError("Couldn't save the new name. Try again.")
    } finally {
      setRenaming(false)
    }
  }, [renameDraft, currentName, projectId, router])

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

  const confirmDelete = useCallback(async () => {
    if (deleting) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) {
        throw new Error(`Delete failed (${res.status})`)
      }
      setDeleteOpen(false)
      setDeleted(true)
      router.refresh()
    } catch (err) {
      console.error("Project delete failed", err)
      setDeleting(false)
    }
  }, [deleting, projectId, router])

  if (deleted) return null

  return (
    <div className={cn("relative flex flex-col gap-2 group", className)}>
      <Link
        href={`/editor/${projectId}`}
        title={currentName}
        aria-label={`Open ${currentName}`}
        className={cn(
          "block aspect-[4/3] overflow-hidden rounded-xl border border-[#2E2E36] bg-[#18181C]",
          "group-hover:border-[#8B5CF6]/70",
          "transition-colors duration-150 ease-out",
        )}
      >
        {status === "loading" && (
          <div className="h-full w-full grid place-items-center text-[#9CA3AF]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        {status === "ready" && canvas && (
          <CanvasPreview nodes={canvas.nodes} edges={canvas.edges} />
        )}
        {status === "empty" && (
          <div className="h-full w-full grid place-items-center text-[11px] text-[#9CA3AF]">
            Empty canvas
          </div>
        )}
        {status === "error" && (
          <div className="h-full w-full grid place-items-center text-[11px] text-[#EF4444]">
            Couldn&apos;t load
          </div>
        )}
      </Link>

      <CardMenu
        onRename={openRename}
        onCopyRoomId={handleCopyRoomId}
        onExportImage={handleExportImage}
        onShare={() => setShareOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        busy={deleting}
      />

      <Link
        href={`/editor/${projectId}`}
        title={currentName}
        className="px-1 text-sm font-medium text-[#F3F4F6] truncate hover:text-[#8B5CF6] transition-colors duration-150 ease-out"
      >
        {currentName}
      </Link>

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        draft={renameDraft}
        onDraftChange={setRenameDraft}
        onSubmit={() => void commitRename()}
        busy={renaming}
        error={renameError}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        name={currentName}
        onConfirm={() => void confirmDelete()}
        busy={deleting}
      />

      <ShareDialogInner
        projectId={projectId}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  )
}

function CardMenu({
  onRename,
  onCopyRoomId,
  onExportImage,
  onShare,
  onDelete,
  busy,
}: {
  onRename: () => void
  onCopyRoomId: () => void
  onExportImage: () => void
  onShare: () => void
  onDelete: () => void
  busy: boolean
}) {
  return (
    <div
      className="absolute top-2 right-2 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Project actions"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-lg",
              "border border-[#2E2E36] bg-[#18181C]/90 backdrop-blur-md",
              "text-[#9CA3AF] transition-colors duration-150 ease-out",
              "hover:text-[#F3F4F6] hover:bg-[#23232A]",
              "opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100",
              "focus:opacity-100",
            )}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="min-w-[180px] rounded-xl border border-[#2E2E36] bg-[#18181C]/95 backdrop-blur-md p-1.5 text-[#F3F4F6] shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
        >
          <CardMenuItem
            icon={<Pencil className="h-4 w-4" />}
            label="Rename Project"
            onSelect={onRename}
          />
          <CardMenuItem
            icon={<Copy className="h-4 w-4" />}
            label="Copy Room ID"
            onSelect={onCopyRoomId}
          />
          <CardMenuItem
            icon={<ImageDown className="h-4 w-4" />}
            label="Export Image"
            onSelect={onExportImage}
          />
          <CardMenuItem
            icon={<Share2 className="h-4 w-4" />}
            label="Share"
            onSelect={onShare}
          />
          <div className="my-1 h-px bg-[#2E2E36]" aria-hidden />
          <CardMenuItem
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete"
            onSelect={onDelete}
            destructive
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function CardMenuItem({
  icon,
  label,
  onSelect,
  destructive,
}: {
  icon: React.ReactNode
  label: string
  onSelect: () => void
  destructive?: boolean
}) {
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault()
        onSelect()
      }}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm cursor-pointer",
        "transition-colors duration-150 ease-out",
        destructive
          ? "text-[#EF4444] focus:bg-[#EF4444]/10 focus:text-[#EF4444]"
          : "text-[#F3F4F6] focus:bg-[#23232A] focus:text-[#F3F4F6]",
      )}
    >
      <span className={destructive ? "text-[#EF4444]" : "text-[#9CA3AF]"}>
        {icon}
      </span>
      {label}
    </DropdownMenuItem>
  )
}

function RenameDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onSubmit,
  busy,
  error,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  draft: string
  onDraftChange: (next: string) => void
  onSubmit: () => void
  busy: boolean
  error: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      el.focus()
      el.select()
    })
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md rounded-2xl border border-[#2E2E36] bg-[#18181C] text-[#F3F4F6]",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-[#F3F4F6]">Rename project</DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            Give this project a new name.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="flex flex-col gap-2"
        >
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            disabled={busy}
            placeholder="Project name"
            style={{
              color: "#F3F4F6",
              backgroundColor: "#0F0F12",
              WebkitTextFillColor: "#F3F4F6",
              caretColor: "#F3F4F6",
            }}
            className="border-[#2E2E36] placeholder:text-[#505060]"
          />
          {error && <p className="text-xs text-[#EF4444]">{error}</p>}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="border-[#2E2E36] bg-transparent text-[#F3F4F6] hover:bg-[#23232A] hover:text-[#F3F4F6]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy || !draft.trim()}
              style={{ backgroundColor: "#8B5CF6", color: "white" }}
              className="hover:opacity-90"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Rename"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  open,
  onOpenChange,
  name,
  onConfirm,
  busy,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  name: string
  onConfirm: () => void
  busy: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md rounded-2xl border border-[#2E2E36] bg-[#18181C] text-[#F3F4F6]",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-[#F3F4F6]">Delete project?</DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            <span className="text-[#F3F4F6] font-medium">{name}</span> will be
            permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="border-[#2E2E36] bg-transparent text-[#F3F4F6] hover:bg-[#23232A] hover:text-[#F3F4F6]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{ backgroundColor: "#EF4444", color: "white" }}
            className="hover:opacity-90"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
