import { randomUUID } from "node:crypto"

import { logger, metadata, task } from "@trigger.dev/sdk/v3"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { put } from "@vercel/blob"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { AiChatMessageSchema } from "@/types/tasks"

const SpecNodeSchema = z.object({
  id: z.string().min(1),
  data: z
    .object({
      label: z.string().optional(),
      color: z.string().optional(),
      shape: z.string().optional(),
    })
    .passthrough()
    .optional(),
  position: z
    .object({ x: z.number(), y: z.number() })
    .optional(),
})

const SpecEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  data: z
    .object({ label: z.string().optional() })
    .passthrough()
    .optional(),
})

export const GenerateSpecPayloadSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(AiChatMessageSchema).default([]),
  nodes: z.array(SpecNodeSchema).default([]),
  edges: z.array(SpecEdgeSchema).default([]),
})

export type GenerateSpecPayload = z.infer<typeof GenerateSpecPayloadSchema>

const CHAT_HISTORY_LIMIT = 40

const SYSTEM_PROMPT_LINES = [
  "You are a senior software architect generating a technical specification document for a system the user has designed on a collaborative canvas.",
  "",
  "You receive:",
  "1. A JSON snapshot of the canvas graph (nodes and edges).",
  "2. A trimmed chat transcript between the user(s) and the design agent for additional context and intent.",
  "",
  "Produce a single Markdown document that documents the architecture as it now exists. Treat the canvas as the source of truth — the chat is supporting context only.",
  "",
  "Output rules:",
  "- Plain GitHub-flavored Markdown. No HTML, no front matter, no code fences wrapping the whole document.",
  "- Begin with a top-level heading naming the system, then an Overview section in 2-4 sentences.",
  "- Include these sections in order, omitting any with no relevant content: Overview, Components, Data Flow, External Integrations, Storage, Considerations.",
  "- Each Components entry: ### Component name, followed by a one or two sentence description and (if useful) a short bulleted list of responsibilities.",
  "- In Data Flow, describe how requests/events traverse the diagram. Reference components by the exact labels used on the canvas.",
  "- In External Integrations, list third-party systems (hexagon nodes are usually external).",
  "- In Storage, list databases / object stores and what they hold.",
  "- In Considerations, call out scaling, reliability, or open questions implied by the diagram.",
  "- Do not invent components that are not present in the canvas. If the canvas is empty, return a short Markdown document stating that no architecture has been drawn yet.",
  "- Keep the writing precise and engineering-grade. No marketing tone, no emoji.",
]

export const generateSpecTask = task({
  id: "generate-spec",
  maxDuration: 600,
  run: async (rawPayload: GenerateSpecPayload, { ctx }) => {
    const parsed = GenerateSpecPayloadSchema.safeParse(rawPayload)
    if (!parsed.success) {
      throw new Error(
        `Invalid generate-spec payload: ${parsed.error.message}`,
      )
    }
    const { projectId, roomId, chatHistory, nodes, edges } = parsed.data
    const runId = ctx.run.id

    metadata.set("status", "start")
    metadata.set("statusText", "Reviewing canvas…")

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is not set")
    }
    const google = createGoogleGenerativeAI({ apiKey })

    const trimmedChat = chatHistory.slice(-CHAT_HISTORY_LIMIT)
    const transcript = trimmedChat
      .map(
        (m) =>
          `[${new Date(m.timestamp).toISOString()}] ${m.role} (${m.sender}): ${m.content}`,
      )
      .join("\n")

    const canvasSnapshot = JSON.stringify(
      {
        nodes: nodes.map((n) => ({
          id: n.id,
          label: n.data?.label ?? "",
          shape: n.data?.shape ?? null,
          color: n.data?.color ?? null,
          position: n.position ?? null,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.data?.label ?? "",
        })),
      },
      null,
      2,
    )

    const userPrompt = [
      `Project id: ${projectId}`,
      `Room id: ${roomId}`,
      "",
      "Canvas snapshot (JSON):",
      canvasSnapshot,
      "",
      "Chat transcript (most recent first or chronological, may be empty):",
      transcript || "(no chat history)",
    ].join("\n")

    logger.log("generate-spec preparing prompt", {
      runId,
      projectId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      chatMessages: trimmedChat.length,
    })

    metadata.set("status", "processing")
    metadata.set("statusText", "Writing technical spec…")

    try {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: SYSTEM_PROMPT_LINES.join("\n"),
        prompt: userPrompt,
      })

      const content = text.trim()
      if (!content) {
        throw new Error("Gemini returned an empty spec")
      }

      metadata.set("statusText", "Saving spec…")

      const specId = randomUUID()
      const pathname = `specs/${projectId}/${specId}.md`
      const blob = await put(pathname, content, {
        access: "private",
        contentType: "text/markdown; charset=utf-8",
        allowOverwrite: false,
        addRandomSuffix: false,
      })

      await prisma.projectSpec.create({
        data: {
          id: specId,
          projectId,
          filePath: blob.url,
        },
      })

      metadata.set("status", "complete")
      metadata.set("statusText", "Spec ready")

      logger.log("generate-spec completed", {
        runId,
        projectId,
        specId,
        contentLength: content.length,
      })

      return {
        ok: true as const,
        runId,
        projectId,
        roomId,
        specId,
        filePath: blob.url,
        content,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      logger.error("generate-spec failed", { error: message, runId, projectId })
      metadata.set("status", "error")
      metadata.set("statusText", "Spec generation failed")
      throw err
    }
  },
})
