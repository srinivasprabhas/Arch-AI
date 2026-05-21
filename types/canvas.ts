import type { Edge, Node } from "@xyflow/react"

export type CanvasNodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  shape: CanvasNodeShape
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">

export interface NodeShapeMeta {
  shape: CanvasNodeShape
  label: string
  defaultWidth: number
  defaultHeight: number
}

export const NODE_SHAPES: readonly NodeShapeMeta[] = [
  { shape: "rectangle", label: "Rectangle", defaultWidth: 180, defaultHeight: 90 },
  { shape: "diamond", label: "Diamond", defaultWidth: 170, defaultHeight: 140 },
  { shape: "circle", label: "Circle", defaultWidth: 120, defaultHeight: 120 },
  { shape: "pill", label: "Pill", defaultWidth: 200, defaultHeight: 70 },
  { shape: "cylinder", label: "Cylinder", defaultWidth: 160, defaultHeight: 120 },
  { shape: "hexagon", label: "Hexagon", defaultWidth: 170, defaultHeight: 100 },
] as const

export interface NodeColor {
  fill: string
  text: string
}

export const NODE_COLORS: readonly NodeColor[] = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const

export const DEFAULT_NODE_COLOR: NodeColor = NODE_COLORS[0]

export function getNodeTextColor(fill: string): string {
  return NODE_COLORS.find((c) => c.fill === fill)?.text ?? DEFAULT_NODE_COLOR.text
}

export interface ShapeDragPayload {
  shape: CanvasNodeShape
  width: number
  height: number
}

export const SHAPE_DRAG_MIME = "application/x-arch-ai-shape"
