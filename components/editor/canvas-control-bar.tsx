"use client"

import { type ComponentPropsWithoutRef, type MouseEvent } from "react"
import { Panel } from "@xyflow/react"
import {
  Maximize,
  Redo2,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface CanvasControlBarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  leftOffset?: number
}

export function CanvasControlBar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  leftOffset = 0,
}: CanvasControlBarProps) {
  return (
    <Panel
      position="bottom-left"
      className="mb-4!"
      style={{
        marginLeft: 16 + leftOffset,
        transition: "margin-left 300ms ease-in-out",
      }}
    >
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 px-2 py-1.5 shadow-lg backdrop-blur">
        <ControlButton icon={ZoomOut} label="Zoom out" onClick={onZoomOut} />
        <ControlButton icon={Maximize} label="Fit view" onClick={onFitView} />
        <ControlButton icon={ZoomIn} label="Zoom in" onClick={onZoomIn} />
        <span
          aria-hidden
          className="mx-1 h-4 w-px bg-surface-border"
        />
        <ControlButton
          icon={Undo2}
          label="Undo"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <ControlButton
          icon={Redo2}
          label="Redo"
          onClick={onRedo}
          disabled={!canRedo}
        />
      </div>
    </Panel>
  )
}

interface ControlButtonProps extends ComponentPropsWithoutRef<"button"> {
  icon: LucideIcon
  label: string
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  className,
  ...rest
}: ControlButtonProps) {
  function handleMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full text-copy-secondary transition-colors hover:bg-elevated hover:text-copy-primary disabled:cursor-not-allowed disabled:text-copy-faint disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-copy-faint",
        className,
      )}
      {...rest}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
