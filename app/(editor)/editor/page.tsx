"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjectDialogsContext } from "@/hooks/use-project-dialogs"

export default function EditorPage() {
  const { openCreate } = useProjectDialogsContext()

  return (
    <div className="flex flex-1 h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
        <h1 className="text-lg font-semibold text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-muted">
          Start a new architecture workspace or choose a project from the sidebar
        </p>
        <Button
          onClick={openCreate}
          className="gap-2 bg-brand text-base-foreground hover:bg-brand/90 mt-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  )
}
