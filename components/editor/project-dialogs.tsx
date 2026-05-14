"use client"

import { useEffect, useRef } from "react"
import { EditorDialog } from "@/components/editor/editor-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectDialogsContext } from "@/hooks/use-project-dialogs"

export function ProjectDialogs() {
  const {
    dialogType,
    activeProject,
    nameInput,
    roomIdPreview,
    isLoading,
    closeDialog,
    setNameInput,
    handleSubmit,
  } = useProjectDialogsContext()

  return (
    <>
      <CreateProjectDialog
        open={dialogType === "create"}
        nameInput={nameInput}
        roomIdPreview={roomIdPreview}
        isLoading={isLoading}
        onNameChange={setNameInput}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <RenameProjectDialog
        open={dialogType === "rename"}
        currentName={activeProject?.name ?? ""}
        nameInput={nameInput}
        isLoading={isLoading}
        onNameChange={setNameInput}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <DeleteProjectDialog
        open={dialogType === "delete"}
        projectName={activeProject?.name ?? ""}
        isLoading={isLoading}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </>
  )
}

interface CreateProjectDialogProps {
  open: boolean
  nameInput: string
  roomIdPreview: string
  isLoading: boolean
  onNameChange: (name: string) => void
  onClose: () => void
  onSubmit: () => void
}

function CreateProjectDialog({
  open,
  nameInput,
  roomIdPreview,
  isLoading,
  onNameChange,
  onClose,
  onSubmit,
}: CreateProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && nameInput.trim()) onSubmit()
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="New project"
      description="Give your architecture workspace a name."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}
            className="text-copy-muted hover:text-copy-primary">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!nameInput.trim() || isLoading}
            className="bg-brand text-base-foreground hover:bg-brand/90"
          >
            Create
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 py-2">
        <Input
          ref={inputRef}
          placeholder="Project name"
          value={nameInput}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-subtle border-surface-border text-copy-primary placeholder:text-copy-faint"
        />
        <p className="text-xs text-copy-muted font-mono">
          room id: <span className="text-copy-secondary">{roomIdPreview || "—"}</span>
        </p>
      </div>
    </EditorDialog>
  )
}

interface RenameProjectDialogProps {
  open: boolean
  currentName: string
  nameInput: string
  isLoading: boolean
  onNameChange: (name: string) => void
  onClose: () => void
  onSubmit: () => void
}

function RenameProjectDialog({
  open,
  currentName,
  nameInput,
  isLoading,
  onNameChange,
  onClose,
  onSubmit,
}: RenameProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
      return () => clearTimeout(t)
    }
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && nameInput.trim()) onSubmit()
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Rename project"
      description={`Renaming "${currentName}"`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}
            className="text-copy-muted hover:text-copy-primary">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!nameInput.trim() || isLoading}
            className="bg-brand text-base-foreground hover:bg-brand/90"
          >
            Rename
          </Button>
        </>
      }
    >
      <div className="py-2">
        <Input
          ref={inputRef}
          placeholder="Project name"
          value={nameInput}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-subtle border-surface-border text-copy-primary placeholder:text-copy-faint"
        />
      </div>
    </EditorDialog>
  )
}

interface DeleteProjectDialogProps {
  open: boolean
  projectName: string
  isLoading: boolean
  onClose: () => void
  onSubmit: () => void
}

function DeleteProjectDialog({
  open,
  projectName,
  isLoading,
  onClose,
  onSubmit,
}: DeleteProjectDialogProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Delete project"
      description={`"${projectName}" will be permanently deleted. This cannot be undone.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}
            className="text-copy-muted hover:text-copy-primary">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            variant="destructive"
          >
            Delete
          </Button>
        </>
      }
    />
  )
}
