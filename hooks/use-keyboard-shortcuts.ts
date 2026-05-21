"use client"

import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

interface UseKeyboardShortcutsOptions {
  reactFlow: Pick<ReactFlowInstance, "zoomIn" | "zoomOut" | "fitView">
  onUndo: () => void
  onRedo: () => void
}

const ZOOM_DURATION = 200

export function useKeyboardShortcuts({
  reactFlow,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return

      const isMod = event.metaKey || event.ctrlKey
      const key = event.key

      if (isMod && (key === "z" || key === "Z")) {
        event.preventDefault()
        if (event.shiftKey) {
          onRedo()
        } else {
          onUndo()
        }
        return
      }

      if (isMod && (key === "y" || key === "Y")) {
        event.preventDefault()
        onRedo()
        return
      }

      if (isMod) return

      if (key === "+" || key === "=") {
        event.preventDefault()
        reactFlow.zoomIn({ duration: ZOOM_DURATION })
        return
      }

      if (key === "-" || key === "_") {
        event.preventDefault()
        reactFlow.zoomOut({ duration: ZOOM_DURATION })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [reactFlow, onUndo, onRedo])
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (target.isContentEditable) return true
  return false
}
