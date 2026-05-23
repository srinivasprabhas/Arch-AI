"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Copy, Eye, Globe, Loader2, Lock, Trash2 } from "lucide-react"
import { EditorDialog } from "@/components/editor/editor-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useWorkspace } from "@/hooks/use-workspace"
import { cn } from "@/lib/utils"

interface Collaborator {
  id: string
  email: string
  displayName?: string
  imageUrl?: string
}

interface CollaboratorsResponse {
  isOwner: boolean
  publicViewEnabled: boolean
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

export function ShareDialogInner({
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
  const [copiedPublic, setCopiedPublic] = useState(false)
  const [publicLinkEnabled, setPublicLinkEnabled] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setIsLoading(true)
    setLoadError(null)
    setData(null)
    fetch(`/api/projects/${projectId}/collaborators`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((d: CollaboratorsResponse) => {
        if (cancelled) return
        setData(d)
        setPublicLinkEnabled(!!d.publicViewEnabled)
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
      setCopiedPublic(false)
      setToggleError(null)
    }
  }, [open])

  const handleTogglePublic = useCallback(
    async (next: boolean) => {
      const prev = publicLinkEnabled
      setPublicLinkEnabled(next)
      setIsToggling(true)
      setToggleError(null)
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicViewEnabled: next }),
        })
        if (!res.ok) throw new Error(`Toggle failed (${res.status})`)
      } catch (err) {
        console.error("Public view toggle failed", err)
        setPublicLinkEnabled(prev)
        setToggleError("Couldn't update sharing setting.")
      } finally {
        setIsToggling(false)
      }
    },
    [projectId, publicLinkEnabled],
  )

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

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/editor/${projectId}?view=read-only`
      : ""

  const handleCopyPublic = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopiedPublic(true)
      setTimeout(() => setCopiedPublic(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }, [publicUrl])

  const isOwner = data?.isOwner ?? false

  return (
    <EditorDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Share project"
      description={
        isOwner
          ? "Invite collaborators by email or share a public view-only link."
          : "You have view-only access to this project."
      }
    >
      <div className="flex flex-col gap-5 py-2">
        {isOwner && (
          <section className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[#9CA3AF]">Invite by email</p>
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
                  className={cn(
                    "border-[#2E2E36] bg-[#0F0F12] text-[#F3F4F6]",
                    "placeholder:text-[#505060]",
                  )}
                />
                <Button
                  type="submit"
                  disabled={!email.trim() || isInviting}
                  className="bg-[#8B5CF6] text-white hover:bg-[#A78BFA] active:bg-[#7C3AED] shrink-0"
                >
                  {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                </Button>
              </div>
              {inviteError && (
                <p className="text-xs text-[#EF4444]">{inviteError}</p>
              )}
            </form>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <p className="text-xs font-medium text-[#9CA3AF]">Collaborators</p>
          <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-[#9CA3AF]" />
              </div>
            )}
            {!isLoading && loadError && (
              <p className="py-4 text-center text-xs text-[#EF4444]">{loadError}</p>
            )}
            {!isLoading && !loadError && data && data.collaborators.length === 0 && (
              <p className="py-4 text-center text-xs text-[#9CA3AF]">
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
        </section>

        <Separator className="bg-[#2E2E36]" />

        <section className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#8B5CF6]/15">
              <Globe className="h-4 w-4 text-[#8B5CF6]" />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F3F4F6]">Public link</p>
              <p className="text-xs text-[#9CA3AF] flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Anyone with the link gets view-only access
              </p>
            </div>
            <Switch
              checked={publicLinkEnabled}
              onCheckedChange={(next) => void handleTogglePublic(next)}
              disabled={!isOwner || isToggling}
              aria-label="Toggle public link"
              className={cn(
                "data-[state=checked]:bg-[#8B5CF6]",
                "data-[state=unchecked]:bg-[#2E2E36]",
              )}
            />
          </div>

          {toggleError && (
            <p className="text-xs text-[#EF4444]">{toggleError}</p>
          )}

          {publicLinkEnabled && (
            <div className="flex gap-2">
              <Input
                value={publicUrl}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                className={cn(
                  "border-[#2E2E36] bg-[#0F0F12] text-[#F3F4F6] font-mono text-xs",
                )}
              />
              <Button
                type="button"
                onClick={() => void handleCopyPublic()}
                className="bg-[#8B5CF6] text-white hover:bg-[#A78BFA] active:bg-[#7C3AED] shrink-0"
              >
                {copiedPublic ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedPublic ? "Copied" : "Copy link"}
              </Button>
            </div>
          )}

          <p
            className={cn(
              "flex items-start gap-2 rounded-xl border border-[#2E2E36] bg-[#0F0F12]",
              "px-3 py-2.5 text-xs text-[#9CA3AF]",
            )}
          >
            <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#9CA3AF]" />
            <span>
              Only invited members can edit this canvas and collaborate in real
              time. Public links are view-only.
            </span>
          </p>
        </section>
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
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[#23232A]">
      <Avatar collaborator={collaborator} />
      <div className="min-w-0 flex-1">
        {collaborator.displayName ? (
          <>
            <p className="truncate text-sm text-[#F3F4F6]">{collaborator.displayName}</p>
            <p className="truncate text-xs text-[#9CA3AF]">{collaborator.email}</p>
          </>
        ) : (
          <p className="truncate text-sm text-[#F3F4F6]">{collaborator.email}</p>
        )}
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${collaborator.email}`}
          className={cn(
            "rounded-lg p-1 text-[#9CA3AF] opacity-0 transition-all",
            "hover:bg-[#0F0F12] hover:text-[#EF4444] group-hover:opacity-100",
          )}
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
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    )
  }
  const initial = (collaborator.displayName ?? collaborator.email).trim().charAt(0).toUpperCase()
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2E2E36] bg-[#0F0F12]">
      <span className="text-xs font-medium text-[#9CA3AF]">{initial || "?"}</span>
    </div>
  )
}
