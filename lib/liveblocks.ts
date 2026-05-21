import { Liveblocks } from "@liveblocks/node"

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined
}

export function getLiveblocksClient(): Liveblocks {
  const cached = globalForLiveblocks.liveblocks
  if (cached) return cached

  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
  }

  const client = new Liveblocks({ secret })

  if (process.env.NODE_ENV !== "production") {
    globalForLiveblocks.liveblocks = client
  }

  return client
}

const CURSOR_COLOR_PALETTE = [
  "#F87171",
  "#FB923C",
  "#FBBF24",
  "#A3E635",
  "#34D399",
  "#22D3EE",
  "#60A5FA",
  "#818CF8",
  "#A78BFA",
  "#E879F9",
  "#F472B6",
  "#FB7185",
] as const

export function getCursorColorForUser(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % CURSOR_COLOR_PALETTE.length
  return CURSOR_COLOR_PALETTE[index]
}
