"use client"

import { useMemo } from "react"
import { EditorDialog } from "@/components/editor/editor-dialog"
import { Button } from "@/components/ui/button"
import { getNodeTextColor, type CanvasNodeShape } from "@/types/canvas"
import { STARTER_TEMPLATES } from "@/lib/templates"
import type { StarterTemplate } from "@/types/template"

const PREVIEW_WIDTH = 260
const PREVIEW_HEIGHT = 140
const PREVIEW_PADDING = 8

interface StarterTemplatesModalProps {
  open: boolean
  onClose: () => void
  onImport: (template: StarterTemplate) => void
}

export function StarterTemplatesModal({
  open,
  onClose,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Start from a template"
      description="Pick a pre-built diagram to replace your current canvas."
      className="max-w-5xl data-[state=open]:duration-0! data-[state=closed]:duration-0! data-[state=open]:animate-none! data-[state=closed]:animate-none!"
    >
      <div className="max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
          {STARTER_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onImport={() => {
                onImport(template)
                onClose()
              }}
            />
          ))}
        </div>
      </div>
    </EditorDialog>
  )
}

interface TemplateCardProps {
  template: StarterTemplate
  onImport: () => void
}

function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-3">
      <TemplatePreview template={template} />
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-copy-primary">{template.name}</h3>
        <p className="line-clamp-2 text-xs text-copy-muted">{template.description}</p>
      </div>
      <Button
        type="button"
        onClick={onImport}
        className="bg-[#8B5CF6] text-white hover:bg-[#A78BFA] active:bg-[#7C3AED]"
      >
        Import
      </Button>
    </div>
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

function TemplatePreview({ template }: { template: StarterTemplate }) {
  const view = useMemo(() => buildPreviewView(template), [template])

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-base">
      <svg
        viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
        width={PREVIEW_WIDTH}
        height={PREVIEW_HEIGHT}
        className="block h-auto w-full"
        role="img"
        aria-label={`${template.name} preview`}
      >
        {template.edges.map((edge) => {
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
    </div>
  )
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

interface PreviewView {
  nodes: PreviewNode[]
  nodeMap: Map<string, PreviewNode>
}

function buildPreviewView(template: StarterTemplate): PreviewView {
  if (template.nodes.length === 0) {
    return { nodes: [], nodeMap: new Map() }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of template.nodes) {
    const width = readDim(node.style?.width) ?? 160
    const height = readDim(node.style?.height) ?? 80
    const x = node.position.x
    const y = node.position.y
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x + width > maxX) maxX = x + width
    if (y + height > maxY) maxY = y + height
  }

  const contentWidth = Math.max(maxX - minX, 1)
  const contentHeight = Math.max(maxY - minY, 1)
  const availableWidth = PREVIEW_WIDTH - PREVIEW_PADDING * 2
  const availableHeight = PREVIEW_HEIGHT - PREVIEW_PADDING * 2
  const scale = Math.min(availableWidth / contentWidth, availableHeight / contentHeight)
  const offsetX = (PREVIEW_WIDTH - contentWidth * scale) / 2 - minX * scale
  const offsetY = (PREVIEW_HEIGHT - contentHeight * scale) / 2 - minY * scale

  const nodes: PreviewNode[] = template.nodes.map((node) => {
    const width = (readDim(node.style?.width) ?? 160) * scale
    const height = (readDim(node.style?.height) ?? 80) * scale
    const cx = node.position.x * scale + offsetX + width / 2
    const cy = node.position.y * scale + offsetY + height / 2
    return {
      id: node.id,
      cx,
      cy,
      width,
      height,
      shape: node.data.shape,
      fill: node.data.color,
      stroke: getNodeTextColor(node.data.color),
    }
  })

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  return { nodes, nodeMap }
}

function readDim(value: number | string | undefined): number | undefined {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}
