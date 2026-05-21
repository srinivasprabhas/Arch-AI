import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })
import { Liveblocks } from "@liveblocks/node"
import { mutateFlow } from "@liveblocks/react-flow/node"

const roomId = process.argv[2]
if (!roomId) {
  console.error("Usage: node scripts/clear-room-flow.mjs <roomId>")
  process.exit(1)
}
const secret = process.env.LIVEBLOCKS_SECRET_KEY
if (!secret) { console.error("LIVEBLOCKS_SECRET_KEY not set"); process.exit(1) }
const client = new Liveblocks({ secret })

await mutateFlow({ client, roomId }, (flow) => {
  const orphanEdges = flow.edges.filter((e) => !flow.getNode(e.source) || !flow.getNode(e.target))
  console.log(`room ${roomId}: ${flow.nodes.length} nodes, ${flow.edges.length} edges (${orphanEdges.length} orphan)`)
  for (const e of orphanEdges) {
    flow.removeEdge(e.id)
    console.log(`  removed orphan edge ${e.id} (${e.source} -> ${e.target})`)
  }
})

const after = await client.getStorageDocument(roomId, "json")
const nodes = after?.flow?.nodes ? Object.keys(after.flow.nodes).length : 0
const edges = after?.flow?.edges ? Object.keys(after.flow.edges).length : 0
console.log(`after cleanup: ${nodes} nodes, ${edges} edges`)
