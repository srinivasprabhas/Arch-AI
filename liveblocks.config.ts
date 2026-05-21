import type { AiChatEvent, AiStatusEvent } from "@/types/tasks"

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      thinking: boolean
    }

    Storage: {}

    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }

    RoomEvent: AiStatusEvent | AiChatEvent

    ThreadMetadata: {}

    RoomInfo: {}
  }
}

export {}
