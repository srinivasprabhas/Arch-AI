import { z } from "zod"

export const AI_STATUS_EVENT_KIND = "ai-status" as const

export const AI_STATUS_STATES = [
  "start",
  "processing",
  "complete",
  "error",
] as const

export type AiStatusState = (typeof AI_STATUS_STATES)[number]

export const AiStatusEventSchema = z.object({
  kind: z.literal(AI_STATUS_EVENT_KIND),
  state: z.enum(AI_STATUS_STATES),
  text: z.string().optional(),
  runId: z.string().optional(),
})

export type AiStatusEvent = z.infer<typeof AiStatusEventSchema>

export function parseAiStatusEvent(value: unknown): AiStatusEvent | null {
  const result = AiStatusEventSchema.safeParse(value)
  return result.success ? result.data : null
}

export function isAiGenerationActive(state: AiStatusState): boolean {
  return state === "start" || state === "processing"
}

export const AI_CHAT_EVENT_KIND = "ai-chat" as const

export const AI_CHAT_ROLES = ["user", "assistant"] as const
export type AiChatRole = (typeof AI_CHAT_ROLES)[number]

export const AiChatMessageSchema = z.object({
  id: z.string().min(1),
  sender: z.string().min(1),
  role: z.enum(AI_CHAT_ROLES),
  content: z.string().min(1),
  timestamp: z.number(),
})

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>

export const AiChatEventSchema = z.object({
  kind: z.literal(AI_CHAT_EVENT_KIND),
  message: AiChatMessageSchema,
})

export type AiChatEvent = z.infer<typeof AiChatEventSchema>

export function parseAiChatEvent(value: unknown): AiChatEvent | null {
  const result = AiChatEventSchema.safeParse(value)
  return result.success ? result.data : null
}
