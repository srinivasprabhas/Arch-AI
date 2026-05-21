"use client"

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react"
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react"

import { useNodeEditing } from "@/components/editor/node-editing-context"
import type { CanvasEdge } from "@/types/canvas"

const STROKE_REST = "rgba(248, 250, 252, 0.55)"
const STROKE_ACTIVE = "#f8fafc"
const STROKE_WIDTH = 1.5
const INTERACTION_WIDTH = 24
const PATH_BORDER_RADIUS = 8

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const [hovered, setHovered] = useState(false)
  const {
    editingEdgeId,
    startEdgeEditing,
    stopEdgeEditing,
    updateEdgeLabel,
  } = useNodeEditing()

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: PATH_BORDER_RADIUS,
  })

  const isEditing = editingEdgeId === id
  const active = !!selected || hovered
  const label = data?.label ?? ""
  const stroke = active ? STROKE_ACTIVE : STROKE_REST

  const handleEnter = () => setHovered(true)
  const handleLeave = () => setHovered(false)
  const handleDoubleClick = () => startEdgeEditing(id)

  return (
    <>
      <g
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onDoubleClick={handleDoubleClick}
      >
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={markerEnd}
          style={{ transition: "stroke 120ms ease" }}
        />
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={INTERACTION_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <EdgeLabelRenderer>
        <EdgeLabel
          labelX={labelX}
          labelY={labelY}
          label={label}
          active={active}
          isEditing={isEditing}
          onStartEdit={() => startEdgeEditing(id)}
          onStopEdit={stopEdgeEditing}
          onChange={(next) => updateEdgeLabel(id, next)}
        />
      </EdgeLabelRenderer>
    </>
  )
}

interface EdgeLabelProps {
  labelX: number
  labelY: number
  label: string
  active: boolean
  isEditing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
  onChange: (next: string) => void
}

const HINT_TEXT = "Add label"

function EdgeLabel({
  labelX,
  labelY,
  label,
  active,
  isEditing,
  onStartEdit,
  onStopEdit,
  onChange,
}: EdgeLabelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(label)

  useEffect(() => {
    if (!isEditing) {
      setDraft(label)
    }
  }, [isEditing, label])

  useEffect(() => {
    if (!isEditing) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    input.select()
  }, [isEditing])

  const commit = () => {
    const next = draft.trim()
    if (next !== label) {
      onChange(next)
    }
    onStopEdit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault()
      commit()
    }
  }

  const stopBubble = (
    event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>,
  ) => {
    event.stopPropagation()
  }

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    pointerEvents: "all",
  }

  if (isEditing) {
    return (
      <div
        className="nodrag nopan"
        style={wrapperStyle}
        onMouseDown={stopBubble}
        onPointerDown={stopBubble}
        onClick={stopBubble}
        onDoubleClick={stopBubble}
      >
        <span className="relative inline-block">
          <span
            aria-hidden
            className="invisible block whitespace-pre rounded-full px-2.5 py-0.5 text-xs"
          >
            {draft.length > 0 ? draft : HINT_TEXT}
          </span>
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            placeholder={HINT_TEXT}
            className="absolute inset-0 w-full rounded-full border border-surface-border bg-surface px-2.5 py-0.5 text-center text-xs text-copy-primary outline-none placeholder:text-copy-faint focus:border-brand"
          />
        </span>
      </div>
    )
  }

  if (label) {
    return (
      <div
        className="nodrag nopan cursor-text rounded-full border border-surface-border bg-surface/95 px-2.5 py-0.5 text-xs text-copy-primary shadow-sm backdrop-blur"
        style={wrapperStyle}
        onMouseDown={stopBubble}
        onDoubleClick={(event) => {
          event.stopPropagation()
          onStartEdit()
        }}
      >
        {label}
      </div>
    )
  }

  if (active) {
    return (
      <div
        className="nodrag nopan cursor-text rounded-full border border-dashed border-surface-border bg-surface/70 px-2.5 py-0.5 text-xs text-copy-faint"
        style={wrapperStyle}
        onMouseDown={stopBubble}
        onDoubleClick={(event) => {
          event.stopPropagation()
          onStartEdit()
        }}
      >
        {HINT_TEXT}
      </div>
    )
  }

  return null
}
