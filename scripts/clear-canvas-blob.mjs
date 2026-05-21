import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })
import { put } from "@vercel/blob"

const projectId = process.argv[2]
if (!projectId) { console.error("Usage: node scripts/clear-canvas-blob.mjs <projectId>"); process.exit(1) }

// Pathname is deterministic per Feature 21: canvas/{projectId}.json.
// Overwriting with an empty nodes/edges payload — the canvas-load effect in
// canvas.tsx already short-circuits on empty arrays, so nothing repopulates.
const blob = await put(`canvas/${projectId}.json`, JSON.stringify({ nodes: [], edges: [] }), {
  access: "private",
  contentType: "application/json",
  allowOverwrite: true,
  addRandomSuffix: false,
})
console.log("overwrote canvas blob at", blob.url)
