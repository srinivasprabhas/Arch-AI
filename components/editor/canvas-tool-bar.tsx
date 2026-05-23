"use client"

import { useCallback, useRef, type DragEvent } from "react"
import { Panel } from "@xyflow/react"
import {
  Eraser,
  Hand,
  MousePointer2,
  Shapes,
  type LucideIcon,
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  Square,
} from "lucide-react"

import { ShapeView } from "@/components/editor/canvas-node"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  SHAPE_DRAG_MIME,
  type CanvasNodeShape,
  type NodeShapeMeta,
  type ShapeDragPayload,
} from "@/types/canvas"
import { cn } from "@/lib/utils"

export type CanvasTool = "select" | "hand" | "eraser"

const SHAPE_ICONS: Record<CanvasNodeShape, LucideIcon> = {
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
}

interface CanvasToolBarProps {
  tool: CanvasTool
  onToolChange: (tool: CanvasTool) => void
}

export function CanvasToolBar({ tool, onToolChange }: CanvasToolBarProps) {
  return (
    <Panel position="bottom-center" className="mb-4!">
      <div
        className={cn(
          "flex items-center gap-1 rounded-xl border border-[#2E2E36]",
          "bg-[#18181C]/85 backdrop-blur-md px-2 py-1.5",
          "shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
        )}
      >
        <ToolButton
          label="Select"
          active={tool === "select"}
          onClick={() => onToolChange("select")}
        >
          <MousePointer2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Hand (pan)"
          active={tool === "hand"}
          onClick={() => onToolChange("hand")}
        >
          <Hand className="h-4 w-4" />
        </ToolButton>
        <ShapesPopover />
        <ToolButton
          label="Eraser"
          active={tool === "eraser"}
          onClick={() => onToolChange("eraser")}
        >
          <Eraser className="h-4 w-4" />
        </ToolButton>
      </div>
    </Panel>
  )
}

interface ToolButtonProps {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToolButton({ label, active, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg",
        "transition-colors duration-150 ease-out",
        active
          ? "bg-[#8B5CF6]/25 text-[#A78BFA]"
          : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#23232A]",
      )}
    >
      {children}
    </button>
  )
}

function ShapesPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Shapes"
          title="Shapes"
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#23232A]",
            "data-[state=open]:bg-[#8B5CF6]/25 data-[state=open]:text-[#A78BFA]",
            "transition-colors duration-150 ease-out",
          )}
        >
          <Shapes className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        className={cn(
          "w-auto rounded-2xl border border-[#2E2E36]",
          "bg-[#18181C]/95 backdrop-blur-md p-2",
          "shadow-[0_12px_32px_rgba(0,0,0,0.55)]",
        )}
      >
        <div className="grid grid-cols-3 gap-1">
          {NODE_SHAPES.map((meta) => (
            <ShapeButton
              key={meta.shape}
              meta={meta}
              icon={SHAPE_ICONS[meta.shape]}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
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
        title={meta.label}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-lg cursor-grab",
          "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#23232A]",
          "transition-colors duration-150 ease-out active:cursor-grabbing",
        )}
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
