"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { CanvasPreview } from "@/components/dashboard/canvas-preview"
import { cn } from "@/lib/utils"
import type { StarterTemplate } from "@/types/template"

interface TemplateCardProps {
  template: StarterTemplate
  className?: string
}

/**
 * Dashboard-facing template card. Clicking the preview hits
 * `POST /api/projects/from-template`, which atomically creates a new
 * project AND writes the seeded canvas snapshot to the same blob path the
 * autosave route uses. The client redirects to `/editor/[id]` — clean URL,
 * no query params. The canvas's existing on-mount restore effect loads
 * the seeded blob the same way it loads any returning user's project.
 *
 * The in-flight guard is intentionally a `ref` rather than just the busy
 * state: React 18+ may dispatch the click handler synchronously twice
 * before `setBusy(true)` propagates, and a duplicate request would create
 * two projects. The ref short-circuits the second call within the same
 * tick.
 */
export function TemplateCard({ template, className }: TemplateCardProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlightRef = useRef(false)

  const handleUse = useCallback(async () => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/projects/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      })
      if (!res.ok) {
        throw new Error(`Use template failed (${res.status})`)
      }
      const data = (await res.json()) as { id?: string }
      if (!data.id) throw new Error("Missing project id in response")
      router.push(`/editor/${data.id}`)
      // Leave `busy` true and `inFlightRef` true through the route
      // transition — the navigation unmounts the dashboard anyway, and
      // clearing busy here would flash the static state for a frame.
    } catch (err) {
      console.error("Use template failed", err)
      setError("Couldn't start from template. Try again.")
      setBusy(false)
      inFlightRef.current = false
    }
  }, [router, template.id])

  return (
    <div
      className={cn(
        "flex flex-col gap-2 shrink-0 w-[200px]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => void handleUse()}
        disabled={busy}
        aria-label={`Use ${template.name} template`}
        title={template.name}
        className={cn(
          "relative block aspect-[4/3] overflow-hidden rounded-xl border border-[#2E2E36] bg-[#18181C]",
          "text-left transition-colors duration-150 ease-out",
          "hover:border-[#8B5CF6]/70",
          "disabled:cursor-not-allowed",
        )}
      >
        <CanvasPreview nodes={template.nodes} edges={template.edges} />
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-[#0F0F12]/70 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#A78BFA]" />
          </div>
        )}
      </button>

      <div className="flex flex-col gap-0.5 px-1">
        <span
          className="text-sm font-medium text-[#F3F4F6] truncate"
          title={template.name}
        >
          {template.name}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">
          {template.category}
        </span>
      </div>

      {error && (
        <p className="text-[11px] text-[#EF4444] px-1">{error}</p>
      )}
    </div>
  )
}
