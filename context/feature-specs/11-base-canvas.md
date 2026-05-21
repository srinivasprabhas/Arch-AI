replace the canvas holder with a liveblocks react flow canvas

## Implementation

1 keep the workspace page server side

2 create a client side editor/canvas wrapper that sets up the liveblocks room

It should include:
- liveblocksprovider using /api/liveblocks-auth
- room provider using the current room ID
- initial presence with cursor: null
- an error fallback for liveblocks connection issues

3 wire react flow to liveblocks state
- use `useLiveblocksFlow` 
- enable suspense
- start with empty nodes and edges
- pass the synced nodes, edges, and change handlers into reactflow

4 add shared canvas types in types/canvas.ts

node data should support:
- label
- color
- shape

also define custom node and edge types
- canvasNode
- canvasEdge

5 render the basic canvas
 include:
- loose connection behavior
- `fitView`
- `MiniMap`
- dot pattern background

## Scope limits

- don't add controls yet
- don't add custom node or edge rendering yet
- don't add persistence logic
- don't add AI behavior
- keep this focused on the collaborative canvas foundation

## check when done 

- client canvas wrapper sets up the liveblocks room
- react flow uses liveblocks synced nodes and edges
- shared canvas types exist in types/canvas.ts
- npm run build passes
