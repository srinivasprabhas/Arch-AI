"use client"

import { useCallback, useRef, type DragEvent } from "react"
import { Panel } from "@xyflow/react"
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  type LucideIcon,
  Pill,
  Square,
} from "lucide-react"

import { ShapeView } from "@/components/editor/canvas-node"
import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  SHAPE_DRAG_MIME,
  type CanvasNodeShape,
  type NodeShapeMeta,
  type ShapeDragPayload,
} from "@/types/canvas"

const SHAPE_ICONS: Record<CanvasNodeShape, LucideIcon> = {
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
}

export function ShapePanel() {
  return (
    <Panel position="bottom-center" className="mb-4!">
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 px-2 py-1.5 shadow-lg backdrop-blur">
        {NODE_SHAPES.map((meta) => (
          <ShapeButton key={meta.shape} meta={meta} icon={SHAPE_ICONS[meta.shape]} />
        ))}
      </div>
    </Panel>
  )
}

interface ShapeButtonProps {
  meta: NodeShapeMeta
  icon: LucideIcon
}

function ShapeButton({ meta, icon: Icon }: ShapeButtonProps) {
  const ghostRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      const payload: ShapeDragPayload = {
        shape: meta.shape,
        width: meta.defaultWidth,
        height: meta.defaultHeight,
      }
      event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload))
      event.dataTransfer.effectAllowed = "move"

      if (ghostRef.current) {
        event.dataTransfer.setDragImage(
          ghostRef.current,
          meta.defaultWidth / 2,
          meta.defaultHeight / 2,
        )
      }
    },
    [meta],
  )

  return (
    <>
      <button
        type="button"
        draggable
        onDragStart={handleDragStart}
        aria-label={`Drag ${meta.label}`}
        className="grid h-8 w-8 cursor-grab place-items-center rounded-full text-copy-secondary transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
      >
        <Icon className="h-4 w-4" />
      </button>
      <div
        ref={ghostRef}
        aria-hidden
        className="pointer-events-none fixed left-[-9999px] top-[-9999px] opacity-70"
        style={{ width: meta.defaultWidth, height: meta.defaultHeight }}
      >
        <ShapeView shape={meta.shape} color={DEFAULT_NODE_COLOR.fill} />
      </div>
    </>
  )
}
