"use client"

import { type CSSProperties, type MouseEvent } from "react"
import { NodeToolbar, Position } from "@xyflow/react"

import { NODE_COLORS, type NodeColor } from "@/types/canvas"

interface ColorToolbarProps {
  visible: boolean
  activeFill: string
  onSelect: (fill: string) => void
}

export function ColorToolbar({ visible, activeFill, onSelect }: ColorToolbarProps) {
  return (
    <NodeToolbar
      isVisible={visible}
      position={Position.Top}
      offset={12}
      className="nodrag nopan"
    >
      <div
        className="flex items-center gap-1.5 rounded-full border border-surface-border bg-surface/95 px-2 py-1.5 shadow-lg backdrop-blur"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {NODE_COLORS.map((color) => (
          <ColorSwatch
            key={color.fill}
            color={color}
            active={color.fill === activeFill}
            onSelect={onSelect}
          />
        ))}
      </div>
    </NodeToolbar>
  )
}

interface ColorSwatchProps {
  color: NodeColor
  active: boolean
  onSelect: (fill: string) => void
}

function ColorSwatch({ color, active, onSelect }: ColorSwatchProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onSelect(color.fill)
  }

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }

  const style: CSSProperties & Record<"--swatch-text", string> = {
    backgroundColor: color.fill,
    "--swatch-text": color.text,
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      aria-label={`Set node color ${color.fill}`}
      aria-pressed={active}
      data-active={active}
      style={style}
      className="grid h-5 w-5 cursor-pointer place-items-center rounded-full transition-shadow hover:shadow-[0_0_4px_1px_var(--swatch-text)] data-[active=true]:outline-2 data-[active=true]:outline-offset-2 data-[active=true]:outline-[var(--swatch-text)]"
    >
      {active ? (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color.text }}
        />
      ) : null}
    </button>
  )
}
