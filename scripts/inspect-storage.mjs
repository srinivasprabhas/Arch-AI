import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })
import { Liveblocks } from "@liveblocks/node"

const roomId = process.argv[2]
if (!roomId) {
  console.error("Usage: node scripts/inspect-storage.mjs <roomId>")
  process.exit(1)
}

const secret = process.env.LIVEBLOCKS_SECRET_KEY
if (!secret) {
  console.error("LIVEBLOCKS_SECRET_KEY not set")
  process.exit(1)
}
console.log("Using secret key prefix:", secret.slice(0, 15) + "...")

const client = new Liveblocks({ secret })

try {
  const storage = await client.getStorageDocument(roomId, "json")
  console.log("=== STORAGE for room", roomId, "===")
  console.log(JSON.stringify(storage, null, 2))
} catch (err) {
  console.error("getStorageDocument failed:", err.message)
}
