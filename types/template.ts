import type { CanvasEdge, CanvasNode } from "@/types/canvas"

/**
 * High-level bucket used for filtering, grouping, and (eventually) routing
 * marketplace browsing. Extending this is a non-breaking addition — old
 * templates simply keep their existing category.
 */
export type TemplateCategory =
  | "system-design"
  | "devops"
  | "data-pipeline"
  | "ai"
  | "generic"

/**
 * Optional preview metadata. The dashboard renders previews from the node
 * graph itself (SVG, no React Flow instance), but a marketplace listing
 * may eventually want a static thumbnail or a recommended aspect ratio.
 */
export interface TemplatePreviewMetadata {
  /** Suggested aspect ratio for the static preview tile (defaults to 4/3). */
  aspectRatio?: number
  /** Optional pre-rendered thumbnail (e.g. for OG cards / marketplace). */
  thumbnail?: string
}

/**
 * Provenance of a template — used by the registry to discriminate between
 * the built-in starter set and (future) user-, org-, AI- generated ones.
 *
 * The shape of `StarterTemplate` itself stays identical across sources, so
 * consumers don't need a switch statement to render them.
 */
export type TemplateSource =
  | { kind: "builtin" }
  | { kind: "organization"; orgId: string }
  | { kind: "user"; userId: string }
  | { kind: "ai"; runId: string }

/**
 * Immutable starter template snapshot. The shape of `nodes` / `edges` is
 * identical to the live collaborative canvas (`CanvasNode` / `CanvasEdge`)
 * so that the canvas and template pipelines never diverge.
 *
 * Templates are SOURCE snapshots. They are cloned into new projects with
 * fresh IDs — they never become live collaborative documents themselves.
 */
export interface StarterTemplate {
  /** Stable id — never reused across template versions, used as the dedupe key. */
  id: string
  /** Display name (e.g. "Microservices Architecture"). */
  name: string
  /** One-line card description. */
  description: string
  /** Filtering / grouping bucket. */
  category: TemplateCategory
  /** Bump when the template's content changes meaningfully. */
  version: number
  /** Where this template came from. Built-ins use `{ kind: "builtin" }`. */
  source: TemplateSource
  /** Optional preview metadata. */
  preview?: TemplatePreviewMetadata
  /** Initial canvas nodes — same schema as the live canvas. */
  nodes: readonly CanvasNode[]
  /** Initial canvas edges — same schema as the live canvas. */
  edges: readonly CanvasEdge[]
}
