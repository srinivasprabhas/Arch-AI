import {
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
} from "@/types/canvas"
import type { StarterTemplate } from "@/types/template"

const SHAPE_DEFAULTS = Object.fromEntries(
  NODE_SHAPES.map((s) => [s.shape, { width: s.defaultWidth, height: s.defaultHeight }]),
) as Record<CanvasNodeShape, { width: number; height: number }>

const COLOR = {
  neutral: NODE_COLORS[0].fill,
  blue: NODE_COLORS[1].fill,
  purple: NODE_COLORS[2].fill,
  orange: NODE_COLORS[3].fill,
  red: NODE_COLORS[4].fill,
  pink: NODE_COLORS[5].fill,
  green: NODE_COLORS[6].fill,
  teal: NODE_COLORS[7].fill,
} as const

interface NodeSpec {
  id: string
  label: string
  shape: CanvasNodeShape
  color: string
  x: number
  y: number
  width?: number
  height?: number
}

function makeNode(spec: NodeSpec): CanvasNode {
  const defaults = SHAPE_DEFAULTS[spec.shape]
  return {
    id: spec.id,
    type: "canvasNode",
    position: { x: spec.x, y: spec.y },
    style: {
      width: spec.width ?? defaults.width,
      height: spec.height ?? defaults.height,
    },
    data: {
      label: spec.label,
      color: spec.color,
      shape: spec.shape,
    },
  }
}

interface EdgeSpec {
  source: string
  target: string
  label?: string
}

function makeEdges(prefix: string, specs: EdgeSpec[]): CanvasEdge[] {
  return specs.map((spec, index) => ({
    id: `${prefix}-edge-${index + 1}`,
    type: "canvasEdge",
    source: spec.source,
    target: spec.target,
    data: spec.label ? { label: spec.label } : {},
  }))
}

const MICROSERVICES_NODES: CanvasNode[] = [
  makeNode({ id: "ms-client", label: "Client", shape: "circle", color: COLOR.neutral, x: 0, y: 200 }),
  makeNode({ id: "ms-gateway", label: "API Gateway", shape: "pill", color: COLOR.blue, x: 200, y: 200 }),
  makeNode({ id: "ms-auth", label: "Auth Service", shape: "rectangle", color: COLOR.purple, x: 480, y: 40 }),
  makeNode({ id: "ms-users", label: "Users Service", shape: "rectangle", color: COLOR.green, x: 480, y: 180 }),
  makeNode({ id: "ms-orders", label: "Orders Service", shape: "rectangle", color: COLOR.orange, x: 480, y: 320 }),
  makeNode({ id: "ms-payments", label: "Payments Service", shape: "rectangle", color: COLOR.pink, x: 480, y: 460 }),
  makeNode({ id: "ms-users-db", label: "Users DB", shape: "cylinder", color: COLOR.teal, x: 760, y: 170 }),
  makeNode({ id: "ms-orders-db", label: "Orders DB", shape: "cylinder", color: COLOR.teal, x: 760, y: 310 }),
  makeNode({ id: "ms-stripe", label: "Stripe", shape: "hexagon", color: COLOR.neutral, x: 760, y: 470 }),
]

const MICROSERVICES_EDGES: CanvasEdge[] = makeEdges("ms", [
  { source: "ms-client", target: "ms-gateway", label: "HTTPS" },
  { source: "ms-gateway", target: "ms-auth" },
  { source: "ms-gateway", target: "ms-users" },
  { source: "ms-gateway", target: "ms-orders" },
  { source: "ms-gateway", target: "ms-payments" },
  { source: "ms-users", target: "ms-users-db" },
  { source: "ms-orders", target: "ms-orders-db" },
  { source: "ms-payments", target: "ms-stripe", label: "API" },
])

const CICD_NODES: CanvasNode[] = [
  makeNode({ id: "ci-dev", label: "Developer", shape: "circle", color: COLOR.neutral, x: 0, y: 200 }),
  makeNode({ id: "ci-git", label: "Git Push", shape: "pill", color: COLOR.blue, x: 200, y: 200 }),
  makeNode({ id: "ci-build", label: "Build", shape: "rectangle", color: COLOR.purple, x: 440, y: 200 }),
  makeNode({ id: "ci-test", label: "Test", shape: "rectangle", color: COLOR.orange, x: 680, y: 200 }),
  makeNode({ id: "ci-gate", label: "Passed?", shape: "diamond", color: COLOR.pink, x: 920, y: 180 }),
  makeNode({ id: "ci-staging", label: "Deploy Staging", shape: "rectangle", color: COLOR.green, x: 1180, y: 80 }),
  makeNode({ id: "ci-prod", label: "Deploy Prod", shape: "rectangle", color: COLOR.teal, x: 1180, y: 220 }),
  makeNode({ id: "ci-fail", label: "Notify Dev", shape: "rectangle", color: COLOR.red, x: 1180, y: 360 }),
]

const CICD_EDGES: CanvasEdge[] = makeEdges("ci", [
  { source: "ci-dev", target: "ci-git", label: "commit" },
  { source: "ci-git", target: "ci-build" },
  { source: "ci-build", target: "ci-test" },
  { source: "ci-test", target: "ci-gate" },
  { source: "ci-gate", target: "ci-staging", label: "yes" },
  { source: "ci-staging", target: "ci-prod", label: "promote" },
  { source: "ci-gate", target: "ci-fail", label: "no" },
])

const EVENT_NODES: CanvasNode[] = [
  makeNode({ id: "ev-producer", label: "Order Service", shape: "rectangle", color: COLOR.blue, x: 0, y: 200 }),
  makeNode({ id: "ev-bus", label: "Event Bus", shape: "pill", color: COLOR.purple, x: 280, y: 200, width: 220 }),
  makeNode({ id: "ev-inventory", label: "Inventory Worker", shape: "rectangle", color: COLOR.orange, x: 580, y: 40 }),
  makeNode({ id: "ev-email", label: "Email Worker", shape: "rectangle", color: COLOR.green, x: 580, y: 180 }),
  makeNode({ id: "ev-analytics", label: "Analytics Worker", shape: "rectangle", color: COLOR.pink, x: 580, y: 320 }),
  makeNode({ id: "ev-shipping", label: "Shipping Worker", shape: "rectangle", color: COLOR.teal, x: 580, y: 460 }),
  makeNode({ id: "ev-warehouse", label: "Warehouse", shape: "cylinder", color: COLOR.neutral, x: 860, y: 170 }),
  makeNode({ id: "ev-mailgun", label: "Mailgun", shape: "hexagon", color: COLOR.neutral, x: 860, y: 310 }),
  makeNode({ id: "ev-metrics", label: "Metrics DB", shape: "cylinder", color: COLOR.neutral, x: 860, y: 450 }),
]

const EVENT_EDGES: CanvasEdge[] = makeEdges("ev", [
  { source: "ev-producer", target: "ev-bus", label: "OrderPlaced" },
  { source: "ev-bus", target: "ev-inventory" },
  { source: "ev-bus", target: "ev-email" },
  { source: "ev-bus", target: "ev-analytics" },
  { source: "ev-bus", target: "ev-shipping" },
  { source: "ev-inventory", target: "ev-warehouse" },
  { source: "ev-email", target: "ev-mailgun" },
  { source: "ev-analytics", target: "ev-metrics" },
])

/**
 * Built-in starter templates. Each entry is a frozen snapshot — never mutated
 * at runtime. The dashboard and the in-canvas template picker both read from
 * this registry, and the server-side `from-template` endpoint resolves
 * templates by id here too.
 *
 * To add a template:
 *  1. Author the nodes/edges via `makeNode`/`makeEdges` above.
 *  2. Append a `StarterTemplate` entry with a unique `id`, a `version: 1`
 *     and the correct `category`.
 *  3. Bump `version` on subsequent content changes.
 */
export const STARTER_TEMPLATES: readonly StarterTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description:
      "API gateway routing requests to independent services, each owning its own datastore.",
    category: "system-design",
    version: 1,
    source: { kind: "builtin" },
    nodes: MICROSERVICES_NODES,
    edges: MICROSERVICES_EDGES,
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "Build, test, gate, and deploy stages from a developer commit through staging and production.",
    category: "devops",
    version: 1,
    source: { kind: "builtin" },
    nodes: CICD_NODES,
    edges: CICD_EDGES,
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "Producer emits domain events to a bus, fanned out to specialized workers and sinks.",
    category: "system-design",
    version: 1,
    source: { kind: "builtin" },
    nodes: EVENT_NODES,
    edges: EVENT_EDGES,
  },
] as const
