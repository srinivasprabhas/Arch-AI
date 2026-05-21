import { logger, task } from "@trigger.dev/sdk/v3"
import { mutateFlow } from "@liveblocks/react-flow/node"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

import { getLiveblocksClient } from "@/lib/liveblocks"
import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
} from "@/types/canvas"
import {
  AI_STATUS_EVENT_KIND,
  type AiStatusEvent,
  type AiStatusState,
} from "@/types/tasks"

export interface DesignAgentPayload {
  prompt: string
  roomId: string
}

const SHAPE_VALUES = NODE_SHAPES.map((s) => s.shape) as unknown as readonly [
  CanvasNodeShape,
  ...CanvasNodeShape[],
]
const COLOR_VALUES = NODE_COLORS.map((c) => c.fill) as unknown as readonly [
  string,
  ...string[],
]

const ACTION_KINDS = [
  "add_node",
  "move_node",
  "resize_node",
  "update_node_data",
  "delete_node",
  "add_edge",
  "delete_edge",
] as const

const ACTION_PRIORITY: Record<(typeof ACTION_KINDS)[number], number> = {
  add_node: 0,
  update_node_data: 1,
  move_node: 1,
  resize_node: 1,
  add_edge: 2,
  delete_edge: 3,
  delete_node: 4,
}

const RawActionSchema = z.object({
  kind: z.enum(ACTION_KINDS),
  id: z.string(),
  shape: z.enum(SHAPE_VALUES).optional(),
  color: z.enum(COLOR_VALUES).optional(),
  label: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  source: z.string().optional(),
  target: z.string().optional(),
})

type RawAction = z.infer<typeof RawActionSchema>

const DesignPlanSchema = z.object({
  summary: z.string(),
  actions: z.array(RawActionSchema),
})

const AI_USER_ID = "ai:design-agent"
const AI_USER_NAME = "Arch AI"
const AI_USER_COLOR = "#6457f9"
const AI_USER_AVATAR = ""
const PRESENCE_TTL_SECONDS = 300
const PRESENCE_CLEAR_TTL_SECONDS = 2

export const STATUS_EVENT_KIND = AI_STATUS_EVENT_KIND
export type { AiStatusState, AiStatusEvent }

const SYSTEM_PROMPT_LINES = [
  "You are an architecture-diagram assistant for a collaborative system-design canvas.",
  "Given the user's request and the current canvas state, return a plan = { summary, actions[] } that produces a complete, well-organized architecture diagram.",
  "",
  "`summary` formatting:",
  "- A concise noun phrase describing the FINAL architecture (what now exists on the canvas).",
  "- Good: \"High-scale e-commerce backend with API gateway, user/catalogue services, Redis cache, NoSQL store, and async order processing via message queue.\"",
  "- Bad: \"Diagramming a high-scale e-commerce backend…\", \"Designing the architecture…\", \"I have created…\". Don't use in-progress verbs, first person, or trailing ellipses — this text is shown AFTER the run completes, not while it's running.",
  "",
  "Each action is a flat object with a `kind` discriminator and optional fields. Always fill the fields required for the chosen kind and omit the rest.",
  "",
  "Allowed kinds and their required fields:",
  "- add_node            → REQUIRED: id, shape, color, label, x, y. Optional: width, height. NEVER omit color or label — every add_node MUST set both, even on the first node of the diagram.",
  "- move_node           → id, x, y.",
  "- resize_node         → id, width, height.",
  "- update_node_data    → id and at least one of { label, color, shape }.",
  "- delete_node         → id.",
  "- add_edge            → id, source, target. label is optional.",
  "- delete_edge         → id.",
  "",
  "Constraints:",
  `- Allowed node shapes: ${NODE_SHAPES.map((s) => s.shape).join(", ")}.`,
  "  Pick the shape that matches what the node represents:",
  "  - rectangle  : generic component (only when nothing more specific fits)",
  "  - pill       : service / process / worker / queue / topic / broker / cache (e.g. \"Order Service\", \"Kafka\", \"Message Queue\", \"Redis Cache\")",
  "  - cylinder   : database / persistent storage / object store (e.g. \"Postgres\", \"NoSQL DB\", \"S3 Bucket\")",
  "  - hexagon    : external / third-party system you do NOT operate (e.g. \"Stripe\", \"Twilio\", \"Auth0\"). Internal infra is never a hexagon.",
  "  - diamond    : decision point / API gateway / load balancer / router / ingress (e.g. \"API Gateway\", \"ALB\")",
  "  - circle     : event / endpoint / API entry (e.g. \"Webhook\", \"Order.Placed event\")",
  `- Allowed node fill colors: ${NODE_COLORS.map((c) => c.fill).join(", ")}.`,
  `- Default fill: ${DEFAULT_NODE_COLOR.fill}.`,
  "- Lay nodes out left-to-right and top-to-bottom with at least 220px horizontal spacing and 160px vertical spacing between node centers.",
  "- Keep x in [0, 1600] and y in [0, 1000].",
  "- Keep labels concise (max ~32 characters).",
  "- Every node id and edge id must be unique. Edges must reference node ids that either already exist on the canvas or are added in this plan.",
  "- Prefer additive plans. Only delete or move existing nodes when the user explicitly asks to refine the diagram.",
  "- Aim for 5-15 nodes for a fresh architecture unless the user requests a smaller diagram.",
]

export const designAgentTask = task({
  id: "design-agent",
  maxDuration: 600,
  run: async (payload: DesignAgentPayload, { ctx }) => {
    const { prompt, roomId } = payload
    const runId = ctx.run.id
    const liveblocks = getLiveblocksClient()

    const publishStatus = async (state: AiStatusState, text: string) => {
      const event: AiStatusEvent = {
        kind: AI_STATUS_EVENT_KIND,
        state,
        text,
        runId,
      }
      try {
        await liveblocks.broadcastEvent(roomId, event)
      } catch (err) {
        logger.warn("broadcastEvent failed", { error: String(err), state })
      }
    }

    const setAiPresence = async (thinking: boolean, ttl: number) => {
      try {
        await liveblocks.setPresence(roomId, {
          userId: AI_USER_ID,
          data: { cursor: null, thinking },
          userInfo: {
            name: AI_USER_NAME,
            color: AI_USER_COLOR,
            avatar: AI_USER_AVATAR,
          },
          ttl,
        })
      } catch (err) {
        logger.warn("setPresence failed", { error: String(err), thinking })
      }
    }

    try {
      await liveblocks.getOrCreateRoom(roomId, {
        defaultAccesses: ["room:write"],
      })

      await publishStatus("start", "Designing your architecture…")
      await setAiPresence(true, PRESENCE_TTL_SECONDS)

      let currentNodes: readonly CanvasNode[] = []
      let currentEdges: readonly CanvasEdge[] = []
      await mutateFlow<CanvasNode, CanvasEdge>(
        { client: liveblocks, roomId },
        (flow) => {
          currentNodes = flow.nodes
          currentEdges = flow.edges
        },
      )

      const apiKey = process.env.GOOGLE_AI_API_KEY
      if (!apiKey) {
        throw new Error("GOOGLE_AI_API_KEY is not set")
      }
      const google = createGoogleGenerativeAI({ apiKey })

      const userPrompt = [
        `User request:\n${prompt}`,
        "",
        "Current canvas (JSON):",
        JSON.stringify(
          {
            nodes: currentNodes.map((n) => ({
              id: n.id,
              data: n.data,
              position: n.position,
            })),
            edges: currentEdges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
              data: e.data ?? {},
            })),
          },
          null,
          2,
        ),
      ].join("\n")

      const { object: plan } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: DesignPlanSchema,
        system: SYSTEM_PROMPT_LINES.join("\n"),
        prompt: userPrompt,
      })

      const validActions = plan.actions.filter((action) => {
        const ok = isActionUsable(action)
        if (!ok) {
          logger.warn("design-agent dropping malformed action", { action })
        }
        return ok
      })

      logger.log("design-agent plan generated", {
        summary: plan.summary,
        actionCount: validActions.length,
        dropped: plan.actions.length - validActions.length,
      })

      await publishStatus(
        "processing",
        `Applying ${validActions.length} change${validActions.length === 1 ? "" : "s"}…`,
      )
      await setAiPresence(true, PRESENCE_TTL_SECONDS)

      // Apply in a deterministic order regardless of what the model emits:
      // adds first so edges can find their endpoints, then mutations, then
      // deletes (which can reference ids the model just added).
      const sortedActions = [...validActions].sort(
        (a, b) => ACTION_PRIORITY[a.kind] - ACTION_PRIORITY[b.kind],
      )

      await mutateFlow<CanvasNode, CanvasEdge>(
        { client: liveblocks, roomId },
        (flow) => {
          for (const action of sortedActions) {
            applyAction(flow, action)
          }
        },
      )

      await publishStatus("complete", plan.summary || "Design complete")
      await setAiPresence(false, PRESENCE_CLEAR_TTL_SECONDS)

      return {
        ok: true as const,
        runId,
        summary: plan.summary,
        actionCount: validActions.length,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error("design-agent failed", { error: message })
      await publishStatus("error", "Design generation failed. Please try again.")
      await setAiPresence(false, PRESENCE_CLEAR_TTL_SECONDS)
      throw err
    }
  },
})

function isActionUsable(action: RawAction): boolean {
  switch (action.kind) {
    case "add_node":
      // shape/color/label are defaulted in applyAction when the model omits
      // them, so only require an id + position to anchor the node.
      return (
        action.id.length > 0 &&
        typeof action.x === "number" &&
        typeof action.y === "number"
      )
    case "move_node":
      return typeof action.x === "number" && typeof action.y === "number"
    case "resize_node":
      return typeof action.width === "number" && typeof action.height === "number"
    case "update_node_data":
      return (
        action.label !== undefined ||
        action.color !== undefined ||
        action.shape !== undefined
      )
    case "delete_node":
    case "delete_edge":
      return action.id.length > 0
    case "add_edge":
      return !!action.source && !!action.target
    default:
      assertNever(action.kind)
      return false
  }
}

type FlowMutator = Parameters<
  Parameters<typeof mutateFlow<CanvasNode, CanvasEdge>>[1]
>[0]

function applyAction(flow: FlowMutator, action: RawAction): void {
  switch (action.kind) {
    case "add_node": {
      const shape = action.shape ?? NODE_SHAPES[0].shape
      const color = action.color ?? DEFAULT_NODE_COLOR.fill
      const shapeMeta =
        NODE_SHAPES.find((s) => s.shape === shape) ?? NODE_SHAPES[0]
      const width = action.width ?? shapeMeta.defaultWidth
      const height = action.height ?? shapeMeta.defaultHeight
      const node: CanvasNode = {
        id: action.id,
        type: "canvasNode",
        position: { x: action.x!, y: action.y! },
        style: { width, height },
        data: {
          label: action.label ?? "",
          color,
          shape,
        },
      }
      flow.addNode(node)
      return
    }
    case "move_node": {
      flow.updateNode(action.id, (n) => ({
        ...n,
        position: { x: action.x!, y: action.y! },
      }))
      return
    }
    case "resize_node": {
      flow.updateNode(action.id, (n) => ({
        ...n,
        style: {
          ...(n.style ?? {}),
          width: action.width!,
          height: action.height!,
        },
      }))
      return
    }
    case "update_node_data": {
      flow.updateNodeData(action.id, (data) => ({
        ...data,
        ...(action.label !== undefined ? { label: action.label } : {}),
        ...(action.color !== undefined ? { color: action.color } : {}),
        ...(action.shape !== undefined ? { shape: action.shape } : {}),
      }))
      return
    }
    case "delete_node": {
      flow.removeNode(action.id)
      return
    }
    case "add_edge": {
      const source = action.source!
      const target = action.target!
      if (!flow.getNode(source) || !flow.getNode(target)) {
        // Skip orphan edges — both endpoints must exist after all
        // add_node actions in this batch have been applied. Otherwise
        // React Flow would store an edge that renders to nothing.
        return
      }
      const edge: CanvasEdge = {
        id: action.id,
        source,
        target,
        type: "canvasEdge",
        data: action.label !== undefined ? { label: action.label } : {},
      }
      flow.addEdge(edge)
      return
    }
    case "delete_edge": {
      flow.removeEdge(action.id)
      return
    }
    default:
      assertNever(action.kind)
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action kind: ${String(value)}`)
}
