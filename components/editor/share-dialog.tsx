"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Copy, Loader2, Trash2 } from "lucide-react"
import { EditorDialog } from "@/components/editor/editor-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWorkspace } from "@/hooks/use-workspace"

interface Collaborator {
  id: string
  email: string
  displayName?: string
  imageUrl?: string
}

interface CollaboratorsResponse {
  isOwner: boolean
  collaborators: Collaborator[]
}

export function ShareDialog() {
  const { project, isShareDialogOpen, closeShareDialog } = useWorkspace()

  if (!project) return null

  return (
    <ShareDialogInner
      key={project.id}
      projectId={project.id}
      open={isShareDialogOpen}
      onClose={closeShareDialog}
    />
  )
}

function ShareDialogInner({
  projectId,
  open,
  onClose,
}: {
  projectId: string
  open: boolean
  onClose: () => void
}) {
  const [data, setData] = useState<CollaboratorsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setIsLoading(true)
    setLoadError(null)
    setData(null)
    fetch(`/api/projects/${projectId}/collaborators`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((d: CollaboratorsResponse) => {
        if (!cancelled) setData(d)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Failed to load collaborators")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, projectId])

  useEffect(() => {
    if (!open) {
      setEmail("")
      setInviteError(null)
      setCopied(false)
    }
  }, [open])

  const handleInvite = useCallback(async () => {
    const trimmed = email.trim()
    if (!trimmed) return
    setIsInviting(true)
    setInviteError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      if (!res.ok) {
        if (res.status === 409) setInviteError("Already a collaborator")
        else if (res.status === 400) setInviteError("Invalid email")
        else if (res.status === 403) setInviteError("Only the owner can invite")
        else setInviteError("Failed to invite")
        return
      }
      const created: Collaborator = await res.json()
      setData((prev) =>
        prev ? { ...prev, collaborators: [...prev.collaborators, created] } : prev
      )
      setEmail("")
    } finally {
      setIsInviting(false)
    }
  }, [email, projectId])

  const handleRemove = useCallback(
    async (collaboratorId: string) => {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      )
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                collaborators: prev.collaborators.filter((c) => c.id !== collaboratorId),
              }
            : prev
        )
      }
    },
    [projectId]
  )

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/editor/${projectId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }, [projectId])

  const isOwner = data?.isOwner ?? false

  return (
    <EditorDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Share project"
      description={
        isOwner
          ? "Invite collaborators by email or share the project link."
          : "You have view-only access to this project."
      }
      footer={
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="gap-2 border-surface-border text-copy-primary hover:bg-elevated"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </Button>
      }
    >
      <div className="flex flex-col gap-4 py-2">
        {isOwner && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleInvite()
            }}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isInviting}
                className="bg-subtle border-surface-border text-copy-primary placeholder:text-copy-faint"
              />
              <Button
                type="submit"
                disabled={!email.trim() || isInviting}
                className="bg-brand text-base-foreground hover:bg-brand/90 shrink-0"
              >
                {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
              </Button>
            </div>
            {inviteError && <p className="text-xs text-error">{inviteError}</p>}
          </form>
        )}

        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-copy-muted">Collaborators</p>
          <div className="flex max-h-60 flex-col gap-0.5 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-copy-muted" />
              </div>
            )}
            {!isLoading && loadError && (
              <p className="py-4 text-center text-xs text-error">{loadError}</p>
            )}
            {!isLoading && !loadError && data && data.collaborators.length === 0 && (
              <p className="py-4 text-center text-xs text-copy-faint">
                No collaborators yet
              </p>
            )}
            {!isLoading &&
              !loadError &&
              data?.collaborators.map((c) => (
                <CollaboratorRow
                  key={c.id}
                  collaborator={c}
                  canRemove={isOwner}
                  onRemove={() => handleRemove(c.id)}
                />
              ))}
          </div>
        </div>
      </div>
    </EditorDialog>
  )
}

function CollaboratorRow({
  collaborator,
  canRemove,
  onRemove,
}: {
  collaborator: Collaborator
  canRemove: boolean
  onRemove: () => void
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-elevated">
      <Avatar collaborator={collaborator} />
      <div className="min-w-0 flex-1">
        {collaborator.displayName ? (
          <>
            <p className="truncate text-sm text-copy-primary">{collaborator.displayName}</p>
            <p className="truncate text-xs text-copy-muted">{collaborator.email}</p>
          </>
        ) : (
          <p className="truncate text-sm text-copy-primary">{collaborator.email}</p>
        )}
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${collaborator.email}`}
          className="rounded-lg p-1 text-copy-muted opacity-0 transition-all hover:bg-subtle hover:text-error group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

function Avatar({ collaborator }: { collaborator: Collaborator }) {
  if (collaborator.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={collaborator.imageUrl}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full bg-subtle object-cover"
      />
    )
  }
  const initial = (collaborator.displayName ?? collaborator.email).trim().charAt(0).toUpperCase()
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-surface-border bg-subtle">
      <span className="text-xs font-medium text-copy-secondary">{initial || "?"}</span>
    </div>
  )
}
