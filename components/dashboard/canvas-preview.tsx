"use client"

import { useMemo } from "react"

import { getNodeTextColor, type CanvasEdge, type CanvasNode, type CanvasNodeShape } from "@/types/canvas"

const PREVIEW_WIDTH = 320
const PREVIEW_HEIGHT = 180
const PREVIEW_PADDING = 10

interface CanvasPreviewProps {
  nodes: readonly CanvasNode[]
  edges: readonly CanvasEdge[]
  width?: number
  height?: number
  className?: string
}

export function CanvasPreview({
  nodes,
  edges,
  width = PREVIEW_WIDTH,
  height = PREVIEW_HEIGHT,
  className,
}: CanvasPreviewProps) {
  const view = useMemo(
    () => buildPreviewView(nodes, width, height),
    [nodes, width, height],
  )

  if (nodes.length === 0) {
    return (
      <div
        className={className ?? "h-full w-full grid place-items-center text-[11px] text-[#9CA3AF]"}
        aria-label="Empty canvas"
      >
        Empty canvas
      </div>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className ?? "block h-full w-full"}
      role="img"
      aria-label="Canvas preview"
    >
      {edges.map((edge) => {
        const source = view.nodeMap.get(edge.source)
        const target = view.nodeMap.get(edge.target)
        if (!source || !target) return null
        return (
          <line
            key={edge.id}
            x1={source.cx}
            y1={source.cy}
            x2={target.cx}
            y2={target.cy}
            stroke="rgba(248, 250, 252, 0.45)"
            strokeWidth={1}
          />
        )
      })}
      {view.nodes.map((node) => (
        <PreviewShape key={node.id} node={node} />
      ))}
    </svg>
  )
}

interface PreviewNode {
  id: string
  cx: number
  cy: number
  width: number
  height: number
  shape: CanvasNodeShape
  fill: string
  stroke: string
}

interface PreviewView {
  nodes: PreviewNode[]
  nodeMap: Map<string, PreviewNode>
}

function PreviewShape({ node }: { node: PreviewNode }) {
  const { cx, cy, width, height, shape, fill, stroke } = node
  const x = cx - width / 2
  const y = cy - height / 2
  const strokeWidth = 0.5

  if (shape === "rectangle") {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={Math.min(3, width / 4)}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    )
  }
  if (shape === "circle" || shape === "pill") {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    )
  }
  if (shape === "diamond") {
    const points = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`
    return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  }
  if (shape === "hexagon") {
    const inset = width * 0.22
    const points = [
      `${x + inset},${y}`,
      `${x + width - inset},${y}`,
      `${x + width},${cy}`,
      `${x + width - inset},${y + height}`,
      `${x + inset},${y + height}`,
      `${x},${cy}`,
    ].join(" ")
    return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  }
  if (shape === "cylinder") {
    const ellipseRy = Math.min(height * 0.12, 4)
    return (
      <g>
        <rect
          x={x}
          y={y + ellipseRy}
          width={width}
          height={height - ellipseRy * 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <ellipse cx={cx} cy={y + ellipseRy} rx={width / 2} ry={ellipseRy} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        <ellipse cx={cx} cy={y + height - ellipseRy} rx={width / 2} ry={ellipseRy} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </g>
    )
  }
  return null
}

function buildPreviewView(
  nodes: readonly CanvasNode[],
  viewW: number,
  viewH: number,
): PreviewView {
  if (nodes.length === 0) return { nodes: [], nodeMap: new Map() }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  for (const node of nodes) {
    const w = readDim(node.style?.width) ?? 160
    const h = readDim(node.style?.height) ?? 80
    const x = node.position.x
    const y = node.position.y
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x + w > maxX) maxX = x + w
    if (y + h > maxY) maxY = y + h
  }

  const contentWidth = Math.max(maxX - minX, 1)
  const contentHeight = Math.max(maxY - minY, 1)
  const availableW = viewW - PREVIEW_PADDING * 2
  const availableH = viewH - PREVIEW_PADDING * 2
  const scale = Math.min(availableW / contentWidth, availableH / contentHeight)
  const offsetX = (viewW - contentWidth * scale) / 2 - minX * scale
  const offsetY = (viewH - contentHeight * scale) / 2 - minY * scale

  const previewNodes: PreviewNode[] = nodes.map((node) => {
    const w = (readDim(node.style?.width) ?? 160) * scale
    const h = (readDim(node.style?.height) ?? 80) * scale
    const cx = node.position.x * scale + offsetX + w / 2
    const cy = node.position.y * scale + offsetY + h / 2
    return {
      id: node.id,
      cx,
      cy,
      width: w,
      height: h,
      shape: node.data.shape,
      fill: node.data.color,
      stroke: getNodeTextColor(node.data.color),
    }
  })

  const nodeMap = new Map(previewNodes.map((n) => [n.id, n]))
  return { nodes: previewNodes, nodeMap }
}

function readDim(value: number | string | undefined): number | undefined {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}
