"use client"

import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react"
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"

import { ColorToolbar } from "@/components/editor/color-toolbar"
import { useNodeEditing } from "@/components/editor/node-editing-context"
import {
  getNodeTextColor,
  type CanvasNode,
  type CanvasNodeShape,
} from "@/types/canvas"

const MIN_NODE_WIDTH = 80
const MIN_NODE_HEIGHT = 60
const RESIZER_COLOR = "rgba(240, 240, 244, 0.6)"

const HANDLE_STYLE: CSSProperties = {
  width: 9,
  height: 9,
  background: "#ffffff",
  border: "1.5px solid var(--bg-base)",
  borderRadius: 9999,
}

const HANDLE_CLASSNAME =
  "!opacity-0 pointer-events-none transition-opacity duration-150 group-hover/canvas-node:!opacity-100 group-hover/canvas-node:pointer-events-auto data-[node-selected=true]:!opacity-100 data-[node-selected=true]:pointer-events-auto"

const HANDLE_POSITIONS: ReadonlyArray<{ id: string; position: Position }> = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
]

interface ShapeViewProps {
  shape: CanvasNodeShape
  color: string
  selected?: boolean
  children?: ReactNode
}

export function ShapeView({ shape, color, selected, children }: ShapeViewProps) {
  const textColor = getNodeTextColor(color)
  const brightness: CSSProperties | undefined = selected
    ? { filter: "brightness(1.3)" }
    : undefined

  const childrenContainerClassName =
    shape === "cylinder"
      ? "absolute inset-0 grid place-items-center pt-4"
      : "absolute inset-0 grid place-items-center"

  let shapeNode: ReactNode = null

  if (shape === "rectangle") {
    shapeNode = (
      <div
        className="absolute inset-0 rounded-xl"
        style={{ background: color }}
      />
    )
  } else if (shape === "circle" || shape === "pill") {
    shapeNode = (
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: color }}
      />
    )
  } else if (shape === "diamond") {
    shapeNode = (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <polygon points="50,2 98,50 50,98 2,50" fill={color} />
      </svg>
    )
  } else if (shape === "hexagon") {
    shapeNode = (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <polygon points="25,2 75,2 98,50 75,98 25,98 2,50" fill={color} />
      </svg>
    )
  } else if (shape === "cylinder") {
    shapeNode = (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d="M 2 14 Q 2 2 50 2 Q 98 2 98 14 L 98 86 Q 98 98 50 98 Q 2 98 2 86 Z"
          fill={color}
        />
        <path
          d="M 2 14 Q 2 26 50 26 Q 98 26 98 14"
          fill="none"
          stroke={textColor}
          strokeOpacity="0.25"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  return (
    <div className="relative h-full w-full" style={brightness}>
      {shapeNode}
      {children !== undefined ? (
        <div className={childrenContainerClassName}>{children}</div>
      ) : null}
    </div>
  )
}

interface LabelLayerProps {
  label: string
  textColor: string
  isEditing: boolean
  onStartEdit: () => void
  onChange: (next: string) => void
  onStopEdit: () => void
}

function LabelLayer({
  label,
  textColor,
  isEditing,
  onStartEdit,
  onChange,
  onStopEdit,
}: LabelLayerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isEditing) return
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    const length = ta.value.length
    ta.setSelectionRange(length, length)
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) return
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }, [isEditing, label])

  if (isEditing) {
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onStopEdit()
      }
    }

    const stopBubble = (event: MouseEvent<HTMLTextAreaElement>) => {
      event.stopPropagation()
    }

    return (
      <textarea
        ref={textareaRef}
        value={label}
        placeholder="Add label"
        rows={1}
        className="nodrag nopan w-full resize-none overflow-hidden bg-transparent px-3 text-center text-sm font-medium leading-tight outline-none placeholder:opacity-50"
        style={{ color: textColor }}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onStopEdit}
        onKeyDown={handleKeyDown}
        onMouseDown={stopBubble}
        onClick={stopBubble}
        onDoubleClick={stopBubble}
      />
    )
  }

  return (
    <div
      onDoubleClick={onStartEdit}
      className="grid h-full w-full cursor-text place-items-center px-3 text-center text-sm font-medium leading-tight wrap-break-word"
      style={{ color: textColor }}
    >
      {label ? (
        <span>{label}</span>
      ) : (
        <span className="opacity-40">Double-click to label</span>
      )}
    </div>
  )
}

export function CanvasNodeRenderer({ id, data, selected }: NodeProps<CanvasNode>) {
  const {
    editingNodeId,
    startEditing,
    stopEditing,
    updateLabel,
    updateColor,
  } = useNodeEditing()
  const isEditing = editingNodeId === id
  const textColor = getNodeTextColor(data.color)

  return (
    <>
      <NodeResizer
        isVisible={!!selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        color={RESIZER_COLOR}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 9999,
          border: "1px solid var(--bg-base)",
        }}
      />
      <ColorToolbar
        visible={!!selected}
        activeFill={data.color}
        onSelect={(fill) => updateColor(id, fill)}
      />
      <div
        className="group/canvas-node relative h-full w-full"
        data-node-selected={!!selected}
      >
        {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
          <Handle
            key={handleId}
            id={handleId}
            type="source"
            position={position}
            style={HANDLE_STYLE}
            className={HANDLE_CLASSNAME}
            data-node-selected={!!selected}
          />
        ))}
        <ShapeView shape={data.shape} color={data.color} selected={selected}>
          <LabelLayer
            label={data.label}
            textColor={textColor}
            isEditing={isEditing}
            onStartEdit={() => startEditing(id)}
            onChange={(next) => updateLabel(id, next)}
            onStopEdit={stopEditing}
          />
        </ShapeView>
      </div>
    </>
  )
}
