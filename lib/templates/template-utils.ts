import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import type { StarterTemplate } from "@/types/template"

export interface ClonedTemplate {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

export interface CloneTemplateOptions {
  /**
   * Generator for fresh ids. Defaults to `crypto.randomUUID` when available,
   * else a `${Date.now()}-${random}` fallback. Pass a deterministic generator
   * in tests for snapshot stability.
   */
  generateId?: () => string
  /** Optional prefix for the new ids — defaults to the template id. */
  idPrefix?: string
}

function defaultGenerateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Deep-clones a template's nodes + edges and remaps every node id to a fresh
 * id so that:
 *  - the original `StarterTemplate` object stays immutable,
 *  - multiple imports into the same room never collide,
 *  - edges still resolve to the cloned nodes via a deterministic id map,
 *  - collaborative sessions (Liveblocks) get stable, unique keys.
 *
 * Important: edges whose source/target don't resolve in the id map are
 * dropped rather than passed through with a stale id — silently keeping a
 * dangling edge would corrupt the canvas snapshot.
 */
export function cloneTemplate(
  template: StarterTemplate,
  options: CloneTemplateOptions = {},
): ClonedTemplate {
  const generateId = options.generateId ?? defaultGenerateId
  const prefix = options.idPrefix ?? template.id

  const nodeIdMap = new Map<string, string>()

  const nodes: CanvasNode[] = template.nodes.map((node) => {
    const newId = `${prefix}-n-${generateId()}`
    nodeIdMap.set(node.id, newId)
    return {
      ...node,
      id: newId,
      position: { ...node.position },
      style: node.style ? { ...node.style } : undefined,
      data: { ...node.data },
      // Drop transient interaction state — these are runtime-only flags.
      selected: false,
      dragging: false,
    }
  })

  const edges: CanvasEdge[] = template.edges.flatMap((edge) => {
    const source = nodeIdMap.get(edge.source)
    const target = nodeIdMap.get(edge.target)
    if (!source || !target) return []
    return [
      {
        ...edge,
        id: `${prefix}-e-${generateId()}`,
        source,
        target,
        data: edge.data ? { ...edge.data } : undefined,
        selected: false,
      },
    ]
  })

  return { nodes, edges }
}

/**
 * Generates a unique project name from a template, accounting for whatever
 * the user already has in their workspace. Mirrors the
 * `Untitled scene N` algorithm from `CreateProjectButton` so the UX is
 * consistent across both create paths.
 */
export function generateTemplateProjectName(
  template: StarterTemplate,
  existingNames: readonly string[],
): string {
  const base = template.name
  const taken = new Set(existingNames.map((n) => n.trim().toLowerCase()))
  if (!taken.has(base.toLowerCase())) return base
  let counter = 2
  while (taken.has(`${base} ${counter}`.toLowerCase())) counter += 1
  return `${base} ${counter}`
}

/**
 * Strips any properties from a cloned template payload that should NOT be
 * persisted as initial canvas state. Defensive against React Flow / Liveblocks
 * version drift — keeps the canvas snapshot stable and minimal.
 *
 * Returned objects are plain — safe to `JSON.stringify` straight into blob.
 */
export function sanitizeTemplateData(payload: ClonedTemplate): ClonedTemplate {
  const nodes: CanvasNode[] = payload.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: { x: node.position.x, y: node.position.y },
    style: node.style ? { ...node.style } : undefined,
    data: { ...node.data },
  }))

  const edges: CanvasEdge[] = payload.edges.map((edge) => ({
    id: edge.id,
    type: edge.type,
    source: edge.source,
    target: edge.target,
    data: edge.data ? { ...edge.data } : undefined,
  }))

  return { nodes, edges }
}
