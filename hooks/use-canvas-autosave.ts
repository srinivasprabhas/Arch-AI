"use client"

import { useEffect, useRef, useState } from "react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error"

interface UseCanvasAutosaveArgs {
  projectId: string
  nodes: readonly CanvasNode[]
  edges: readonly CanvasEdge[]
  enabled?: boolean
  debounceMs?: number
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled = true,
  debounceMs = 1000,
}: UseCanvasAutosaveArgs): CanvasSaveStatus {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSerializedRef = useRef<string | null>(null)
  const firstRunRef = useRef(true)

  useEffect(() => {
    if (!enabled) return

    const serialized = JSON.stringify({ nodes, edges })

    if (firstRunRef.current) {
      firstRunRef.current = false
      lastSerializedRef.current = serialized
      return
    }

    if (serialized === lastSerializedRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void (async () => {
        setStatus("saving")
        try {
          const res = await fetch(`/api/projects/${projectId}/canvas`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: serialized,
          })
          if (!res.ok) throw new Error(`Save failed: ${res.status}`)
          lastSerializedRef.current = serialized
          setStatus("saved")
        } catch (err) {
          console.error("Canvas autosave failed", err)
          setStatus("error")
        }
      })()
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, projectId, enabled, debounceMs])

  return status
}
