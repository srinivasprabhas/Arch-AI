"use client"

import { useStore, type MiniMapNodeProps } from "@xyflow/react"

import type { CanvasNodeData, CanvasNodeShape } from "@/types/canvas"

const FALLBACK_FILL = "var(--bg-elevated)"

export function CanvasMiniMapNode({
  id,
  x,
  y,
  width,
  height,
  color,
  strokeColor,
  strokeWidth,
  shapeRendering,
  className,
  style,
  selected,
}: MiniMapNodeProps) {
  const data = useStore((state) => {
    const node = state.nodeLookup.get(id)
    return node?.internals.userNode.data as CanvasNodeData | undefined
  })

  const shape: CanvasNodeShape = data?.shape ?? "rectangle"
  const fill = color ?? data?.color ?? FALLBACK_FILL

  const commonProps = {
    fill,
    stroke: strokeColor,
    strokeWidth,
    shapeRendering,
    className: ["react-flow__minimap-node", selected ? "selected" : "", className]
      .filter(Boolean)
      .join(" "),
    style,
  }

  if (shape === "circle" || shape === "pill") {
    const radius = Math.min(width, height) / 2
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        {...commonProps}
      />
    )
  }

  if (shape === "diamond") {
    const cx = x + width / 2
    const cy = y + height / 2
    const points = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`
    return <polygon points={points} {...commonProps} />
  }

  if (shape === "hexagon") {
    const left = x
    const right = x + width
    const top = y
    const bottom = y + height
    const inset = width * 0.25
    const midY = y + height / 2
    const points = [
      `${left + inset},${top}`,
      `${right - inset},${top}`,
      `${right},${midY}`,
      `${right - inset},${bottom}`,
      `${left + inset},${bottom}`,
      `${left},${midY}`,
    ].join(" ")
    return <polygon points={points} {...commonProps} />
  }

  if (shape === "cylinder") {
    const left = x
    const right = x + width
    const top = y
    const bottom = y + height
    const cx = x + width / 2
    const lipRadius = Math.min(height * 0.12, 12)
    const d = [
      `M ${left} ${top + lipRadius}`,
      `Q ${left} ${top} ${cx} ${top}`,
      `Q ${right} ${top} ${right} ${top + lipRadius}`,
      `L ${right} ${bottom - lipRadius}`,
      `Q ${right} ${bottom} ${cx} ${bottom}`,
      `Q ${left} ${bottom} ${left} ${bottom - lipRadius}`,
      "Z",
    ].join(" ")
    return <path d={d} {...commonProps} />
  }

  const rectRadius = 6
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rectRadius}
      ry={rectRadius}
      {...commonProps}
    />
  )
}
