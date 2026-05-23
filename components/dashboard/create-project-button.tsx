"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

interface CreateProjectButtonProps {
  existingNames: string[]
}

const BASE_NAME = "Untitled scene"

function nextUntitledName(existing: string[]): string {
  const taken = new Set(existing.map((n) => n.trim().toLowerCase()))
  if (!taken.has(BASE_NAME.toLowerCase())) return BASE_NAME
  let counter = 2
  while (taken.has(`${BASE_NAME} ${counter}`.toLowerCase())) {
    counter += 1
  }
  return `${BASE_NAME} ${counter}`
}

export function CreateProjectButton({ existingNames }: CreateProjectButtonProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const handleCreate = useCallback(async () => {
    if (creating) return
    setCreating(true)
    const name = nextUntitledName(existingNames)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error(`Create failed (${res.status})`)
      const data = (await res.json()) as { id?: string }
      if (!data.id) throw new Error("Missing project id")
      router.push(`/editor/${data.id}`)
    } catch (err) {
      console.error("Create project failed", err)
      setCreating(false)
    }
  }, [creating, existingNames, router])

  return (
    <button
      type="button"
      onClick={() => void handleCreate()}
      disabled={creating}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
        "bg-[#8B5CF6] text-white",
        "hover:bg-[#A78BFA] active:bg-[#7C3AED]",
        "shadow-[0_0_24px_rgba(139,92,246,0.35)]",
        "transition-colors duration-150 ease-out",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      )}
    >
      {creating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Create New Project
    </button>
  )
}
