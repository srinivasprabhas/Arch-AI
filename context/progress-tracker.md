# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Completed Feature 20

## Current Goal

- Next feature (tbd)

## Completed

- **Feature 20: AI Sidebar Shell**
  - Extracted the placeholder `AiSidebar` out of `components/editor/workspace.tsx` into its own dedicated `components/editor/ai-sidebar.tsx`; `Workspace` now just renders `<AiSidebar isOpen={isAiSidebarOpen} onClose={toggleAiSidebar} />`. Parent (`EditorShell` via `WorkspaceContext`) still owns open/close state — the sidebar itself is stateless w.r.t. visibility
  - Preserved the floating-overlay placement and slide-in animation (`absolute inset-y-0 right-0 z-20 w-80 flex flex-col`, `transition-transform duration-300 ease-in-out`, `translate-x-0` ↔ `translate-x-full`); upgraded surface treatment to `bg-base/95 backdrop-blur border-l border-surface-border shadow-2xl` so it reads as a true floating panel against the canvas
  - `SidebarHeader` — 8×8 rounded `bg-accent-dim` chip with Lucide `Bot` icon (`text-ai-text`), stacked title "AI workspace" (`text-copy-primary`, `text-sm font-semibold`) + subtitle "Collaborate with ARC AI" (`text-copy-muted`, `text-xs`); right-side `X` close button mirrors the existing icon-button vocabulary (`rounded-xl text-copy-muted hover:text-copy-primary hover:bg-elevated`)
  - Tabbed layout uses shadcn `Tabs` (`@/components/ui/tabs`) with `defaultValue="architect"` — two triggers ("AI architect", "Specs") in a `grid-cols-2` `TabsList` styled with `bg-surface border border-surface-border rounded-xl p-1`; active trigger overrides shadcn defaults via `data-[state=active]:bg-accent-dim data-[state=active]:text-brand data-[state=active]:shadow-none`, inactive stays `text-copy-muted`. `TabsContent` uses `data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col` so the active panel fills `flex-1 min-h-0` instead of shadcn's default `mt-2` block layout (which would otherwise collapse the chat area)
  - `ArchitectTab` — owns local `messages: ChatMessage[]` and `draft: string` state (no backend; per scope limits). Scrollable chat area is `flex-1 min-h-0 overflow-y-auto px-4 py-4`; `EmptyState` renders when `messages.length === 0` with the same `bg-accent-dim` bot chip from the header, copy ("Start a conversation" / "Describe a system and ARC AI will draft an architecture on your canvas."), and the three required starter chips ("Design an e-commerce backend.", "Create a chat app architecture.", "Build a CI/CD pipeline.") rendered as soft pills (`rounded-full bg-subtle px-3 py-2 text-xs text-brand`, `border border-surface-border hover:bg-elevated`) that submit on click
  - Message bubbles — user messages right-aligned with `bg-accent-dim border-2 border-brand/50 text-copy-primary rounded-2xl`, assistant messages left-aligned with `bg-elevated border border-surface-border text-ai-text rounded-2xl`; both `max-w-[85%]`, `whitespace-pre-wrap break-words` so multi-line input from Shift+Enter renders correctly; an effect tied to `messages` keeps `scrollRef.current.scrollTop = scrollHeight` so new messages auto-scroll into view
  - Input area — `<textarea>` wrapped in a `rounded-2xl border border-surface-border bg-surface focus-within:border-border-subtle` shell; `TEXTAREA_MIN_HEIGHT = 72`, `TEXTAREA_MAX_HEIGHT = 160`. `resizeTextarea()` runs in `useLayoutEffect` on every draft change — sets `style.height = "auto"` then `Math.min(Math.max(scrollHeight, 72), 160)` so the textarea grows with content and caps at 160px (scrollbar takes over past the cap). `onKeyDown` handles Enter (submit, prevents default) vs Shift+Enter (default newline). Send button is `bg-brand text-white` 8×8 rounded square pinned `absolute bottom-2 right-2`, disabled (`opacity-40 cursor-not-allowed`) when the trimmed draft is empty; submit clears `draft` to `""` which trips the layout effect and snaps the textarea back to min height
  - `SpecsTab` — "Generate Spec" CTA uses `bg-ai px-3 py-2.5 rounded-xl text-white font-medium` with a leading `Sparkles` icon (matches the project's AI accent vocabulary); `DemoSpecCard` is a `rounded-2xl border border-surface-border bg-elevated p-4` card with a `FileText` icon in a `bg-subtle` chip, title "E-commerce platform spec", a two-line clamped snippet, and a disabled Download button (`opacity-60 cursor-not-allowed`) styled as a secondary outlined action so users see what the action will become without it being interactive
  - All colors flow through existing project tokens — `bg-base`, `bg-surface`, `bg-elevated`, `bg-subtle`, `bg-accent-dim`, `bg-brand`, `bg-ai`, `text-copy-primary`, `text-copy-muted`, `text-copy-faint`, `text-brand`, `text-ai-text`, `border-surface-border`, `border-border-subtle` — no new colors invented, no raw hex/zinc classes
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 19: Presence Avatars & Live Cursors**
  - Renamed `Presence.isThinking` → `Presence.thinking` in `liveblocks.config.ts` to match spec 19; updated `components/editor/canvas-room.tsx` `initialPresence` to `{ cursor: null, thinking: false }`
  - Created `components/editor/canvas-presence-avatars.tsx` — `CanvasPresenceAvatars` uses `useOthers()` from `@liveblocks/react/suspense` + `useUser()` from `@clerk/nextjs`; filters out the current user by matching `other.id` against the Clerk user id AND dedupes by user id (so the same Clerk user across multiple tabs renders as one avatar); maps each remaining other to a `Collaborator` shape (`{ connectionId, id, name, imageUrl, color }`) with safe fallbacks; renders inside React Flow's `<Panel position="top-right">` so it lives in the canvas viewport top-right corner (not the shared navbar); `style={{ marginRight: 8 + rightOffset }}` slides the group leftwards by `AI_SIDEBAR_WIDTH` when the AI sidebar is open (300ms ease-in-out, matches minimap pattern); avatars render as 28px circles with 2px `ring-bg-base` ring so they read on the dark canvas, overlapping at `-space-x-1.5`; uses `next/image` with `unoptimized` for Clerk avatar URLs (so no `next.config.ts` `remotePatterns` change needed) and a `getInitials(name)` fallback rendered over a presence-color background when no image; up to `MAX_VISIBLE = 5` collaborators are shown, the rest collapse into a `+N` overflow chip styled to match (`bg-elevated`, same 28px diameter, ring); trailing 1px×20px `bg-surface-border` divider only renders when at least one collaborator exists — when no collaborators, the entire component returns `null` so neither avatars nor divider render (the navbar's existing `<UserButton />` carries the current user alone, no extra UI)
  - Created `components/editor/canvas-cursors.tsx` — `CanvasCursors` reads `useOthers()`, filters to others with `presence.cursor !== null` (and excludes the current Clerk user id as belt-and-suspenders against duplicate-tab connections); renders into React Flow's `<ViewportPortal>` so each cursor's `transform: translate(${x}px, ${y}px)` reads in flow coordinates and the cursors automatically pan + zoom with the canvas; each `<RemoteCursor>` is a 18×22 SVG pointer (filled with the participant's presence color, 1px `#0b0b0c` stroke for legibility on light canvas areas, drop-shadow for depth) with an attached colored name pill (rounded-md, white text, `max-w-[160px]` + `truncate` so long names don't blow out the layout); the parent `<div>` is `pointer-events-none` and `aria-hidden` so cursors never intercept clicks or hit the accessibility tree
  - Updated `components/editor/canvas.tsx` — imported `useUpdateMyPresence` from `@liveblocks/react/suspense` plus the two new overlay components; added `handlePointerMove(event)` that calls `screenToFlowPosition({ x: event.clientX, y: event.clientY })` and dispatches `updateMyPresence({ cursor })` so broadcasts are already in flow coordinates (Liveblocks throttles internally — no manual debounce needed); added `handlePointerLeave()` that dispatches `updateMyPresence({ cursor: null })` so others stop seeing this user's cursor when the mouse exits the canvas; wired `onMouseMove={handlePointerMove}` and `onMouseLeave={handlePointerLeave}` on the `<ReactFlow>` component itself (catches movement over both pane and nodes, unlike `onPaneMouseMove` which only fires over the empty pane); rendered `<CanvasCursors />` as the first child of `<ReactFlow>` so cursors paint beneath the panels but above the background; rendered `<CanvasPresenceAvatars rightOffset={isAiSidebarOpen ? AI_SIDEBAR_WIDTH : 0} />` as the last `<ReactFlow>` child so the avatar group anchors top-right and shifts left when the AI sidebar opens
  - Editor navbar (`components/editor/editor-navbar.tsx`) intentionally untouched — the existing Clerk `<UserButton />` remains the sole representation of the current user (matches spec: "Render the current users separately using the existing clerk user button. Do not render a second avatar for them from the live blocks presence list."); editor-home navbar is unchanged because all presence UI is mounted inside `<CanvasRoom>`, which only renders in the editor canvas view
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 18: Starter Template Library**
  - Created `components/editor/starter-templates.ts` — exports `CanvasTemplate` type (`id`, `name`, `description`, `nodes`, `edges`) and the `CANVAS_TEMPLATES` readonly array; data uses shared `CanvasNode` / `CanvasEdge` types, `NODE_SHAPES` defaults (width/height), and `NODE_COLORS` palette via a `COLOR` lookup; `makeNode(spec)` helper resolves shape defaults so each template entry stays readable (label/shape/color/position only); `makeEdges(prefix, specs)` helper generates stable edge ids and only sets `data.label` when provided. Three templates ship: `microservices` (client → API gateway → 4 services → per-service DB + Stripe hexagon), `cicd-pipeline` (developer commit → build → test → diamond gate → staging/prod/notify branches), `event-driven` (producer → event bus pill → 4 fanned-out workers → warehouse/mailgun/metrics sinks)
  - Created `components/editor/starter-templates-modal.tsx` — `StarterTemplatesModal` uses `EditorDialog` (extended to `max-w-3xl`) with title "Start from a template"; renders templates inside a `max-h-[60vh] overflow-y-auto` scroll container as a responsive `grid-cols-1 sm:grid-cols-2 gap-3`; each `TemplateCard` is a `rounded-2xl border border-surface-border bg-surface p-3` panel showing the preview, name, two-line clamped description, and a full-width Import button; clicking Import calls `onImport(template)` then `onClose()`
  - Lightweight SVG preview (no React Flow instance) — `buildPreviewView(template)` computes bounds from each node's `position` + `style.width/height` (`readDim` parses numeric or px-string values, fallback 160×80), derives a uniform `scale = min(availW/contentW, availH/contentH)` to fit inside a fixed `260×140` viewport with 8px padding, and centers via `offsetX/offsetY`; returns `PreviewNode[]` with scaled `cx/cy/width/height` plus a `Map<id, PreviewNode>` for O(1) edge endpoint lookup. Edges render as `<line>` between node centers (`rgba(248,250,252,0.45)`, 1px stroke). `PreviewShape` renders each node by shape: rectangle as `<rect rx>`, circle/pill as `<rect rx={height/2}>`, diamond/hexagon as `<polygon>`, cylinder as a `<g>` with body rect + two `<ellipse>` caps; fill = node color, stroke = paired text color from `getNodeTextColor` so each shape stays visually distinct at thumbnail scale
  - Extended `hooks/use-workspace.ts` — `WorkspaceContextValue` now exposes `isStarterTemplatesOpen`, `openStarterTemplates`, `closeStarterTemplates` (same pattern as the existing share-dialog open state)
  - Updated `components/editor/editor-shell.tsx` — owns the new state via `useState(false)` + `useCallback` open/close handlers; threaded the three values through `WorkspaceContext.Provider`
  - Updated `components/editor/editor-navbar.tsx` — added a "Templates" button (Lucide `LayoutTemplate` icon + label) immediately to the left of the existing Share button, wired to `openStarterTemplates`; same `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl` styling vocabulary as the Share button so the navbar entry points read as a pair
  - Wired import into `components/editor/canvas.tsx` — `importTemplate(template)` runs inside `CanvasInner` so it has access to `useLiveblocksFlow` mutators and `useReactFlow().fitView`; deep-ish clones the template (`position`/`style`/`data` spread) so the static `CANVAS_TEMPLATES` data is never mutated; dispatches one batched `onEdgesChange([...currentEdges.map(remove), ...newEdges.map(add)])` and one batched `onNodesChange([...currentNodes.map(remove), ...newNodes.map(add)])` so the canvas is cleared and repopulated in two atomic Liveblocks updates (edges go first so no orphan edge transiently references a removed node); also clears local `editingNodeId`/`editingEdgeId` state so the import doesn't leave stale editing UI on a node id that no longer exists; `requestAnimationFrame(() => fitView({ duration: 400, padding: 0.2 }))` defers the fit until React Flow has rendered the new nodes so the viewport animates to the right bounds
  - `<StarterTemplatesModal>` rendered as a sibling of `<ReactFlow>` inside `CanvasInner`, reading `isStarterTemplatesOpen`/`closeStarterTemplates` from `useWorkspace()` and passing `importTemplate` as `onImport`
  - All mutations flow through `useLiveblocksFlow`'s `onNodesChange`/`onEdgesChange` pipeline (same collaborative source-of-truth as drops/labels/colors); no server calls and no template saving
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 17: Canvas Ergonomics**
  - Created `hooks/use-keyboard-shortcuts.ts` — `useKeyboardShortcuts({ reactFlow, onUndo, onRedo })` attaches a `keydown` listener on `window`; guards against editable targets (`INPUT`, `TEXTAREA`, `SELECT`, or `isContentEditable`) so typing inside node labels, edge labels, or the share dialog never triggers shortcuts; `Cmd/Ctrl+Z` → undo, `Cmd/Ctrl+Shift+Z` and `Cmd/Ctrl+Y` → redo, bare `+`/`=` → `reactFlow.zoomIn({ duration: 200 })`, bare `-`/`_` → `reactFlow.zoomOut({ duration: 200 })`; zoom shortcuts skip when any modifier key is held so they don't fight browser `Cmd/Ctrl + +/-` page zoom
  - Created `components/editor/canvas-control-bar.tsx` — `CanvasControlBar` uses React Flow's `<Panel position="bottom-left" className="mb-4! ml-4!">` to float a pill-shaped bar above the shape panel; same styling vocabulary as `ShapePanel` (`rounded-full border border-surface-border bg-surface/95 px-2 py-1.5 shadow-lg backdrop-blur`); two groups separated by a 1px `mx-1 h-4 w-px bg-surface-border` divider — zoom group (`ZoomOut`, `Maximize` for fit view, `ZoomIn`) and history group (`Undo2`, `Redo2`); each `ControlButton` is an 8×8 grid-centered button with Lucide icon, hover state, and `disabled` prop that drops opacity to 50% + `text-copy-faint` + `cursor-not-allowed` (no hover background on disabled) so users get clear visual feedback when undo/redo aren't available; `onMouseDown` calls `event.stopPropagation()` so clicks don't reach React Flow's pan handler
  - Updated `components/editor/canvas.tsx` — imported `useCanRedo`, `useCanUndo`, `useRedo`, `useUndo` from `@liveblocks/react/suspense`; pulled `zoomIn`/`zoomOut`/`fitView` off `useReactFlow()`; added `handleZoomIn`/`handleZoomOut`/`handleFitView` callbacks that invoke them with `{ duration: 200 }` so transitions animate smoothly; called `useKeyboardShortcuts({ reactFlow, onUndo: undo, onRedo: redo })` so shortcuts share the same handlers as the buttons; rendered `<CanvasControlBar>` as a child of `<ReactFlow>` between `<MiniMap>` and `<ShapePanel>` so it inherits the React Flow viewport context; shrunk minimap via inline `style={{ width: 140, height: 96, ... }}` (was the React Flow default ~200×150) and enabled `pannable` + `zoomable` props so the smaller minimap remains usable for navigation
  - Undo/redo flows through Liveblocks history — `useLiveblocksFlow` already syncs nodes/edges to Storage, so all collaborative mutations (label edits, color changes, additions, deletions, position updates) are reversible with the same single source of truth
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 16: Edge Behavior**
  - Extended `types/canvas.ts` — `CanvasEdgeData` now has optional `label?: string` so collaborative edges can carry inline labels through the existing Liveblocks edge flow
  - Extended `components/editor/node-editing-context.tsx` — `NodeEditingContextValue` now also exposes `editingEdgeId`, `startEdgeEditing`, `stopEdgeEditing`, and `updateEdgeLabel(edgeId, label)`; same per-client editing-state + collaborative-mutation split as the node label/color flows, so node and edge editing stay mutually exclusive (starting one clears the other)
  - Updated `components/editor/canvas-node.tsx` — added four `<Handle>` components (top/right/bottom/left), all `type="source"` so React Flow's existing `ConnectionMode.Loose` lets users drag from any handle to any other; handles are 9px white dots with a 1.5px dark border (`--bg-base`) for the subtle look; wrapped node body in `<div className="group/canvas-node relative h-full w-full">` with `data-node-selected={!!selected}` and made handles use `!opacity-0 pointer-events-none group-hover/canvas-node:!opacity-100 group-hover/canvas-node:pointer-events-auto data-[node-selected=true]:!opacity-100 data-[node-selected=true]:pointer-events-auto` so they fade in on node hover, stay visible while selected, and can't catch stray pointer events while hidden (named group scope keeps node-hover separate from any other `group` ancestors); `!opacity-*` overrides React Flow's default handle stylesheet
  - Created `components/editor/canvas-edge.tsx` — `CanvasEdgeRenderer` (registered as the `canvasEdge` type); routes via `getSmoothStepPath({ borderRadius: 8 })` for clean right-angle routing and reads `labelX`/`labelY` straight from that tuple (no manual midpoint math); renders two SVG `<path>`s inside an `<g>` instead of `BaseEdge` so the wide invisible hit path (24px stroke) sits in the same group as the visible 1.5px stroke — both `onMouseEnter`/`onMouseLeave` (hover state) and `onDoubleClick` (enter label editing) catch on the wide hit path without bumping visible thickness; stroke transitions between `rgba(248, 250, 252, 0.55)` at rest and `#f8fafc` when `selected || hovered`; arrowhead supplied by `defaultEdgeOptions.markerEnd`
  - Added `EdgeLabel` (inside `canvas-edge.tsx`) — rendered inside `<EdgeLabelRenderer>` portal so the label is a real div (`pointerEvents: "all"`, `nodrag nopan` classes) sitting on top of the SVG canvas at `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`; three states: (a) editing → centered `<input>` with `placeholder="Add label"`, focused + selected on mount via `useEffect`, draft seeded from `data.label`, autosize via paired invisible `<span>` mirror (input is `absolute inset-0` over a span containing draft || placeholder so width follows the text); commit-and-exit on `Enter`, `Escape`, or `blur` (trimmed draft routed through `updateEdgeLabel` → `onEdgesChange [{ type: "replace", id, item: { ...edge, data: { ...edge.data, label } } }]` so Liveblocks broadcasts the change); (b) saved label → small pill badge (`rounded-full border border-surface-border bg-surface/95 px-2.5 py-0.5 text-xs`); (c) no label + active (selected/hovered) → faint dashed "Add label" hint pill; `stopBubble` on `onMouseDown`/`onPointerDown`/`onClick`/`onDoubleClick` keeps clicks/typing from triggering React Flow's drag/pan
  - Updated `components/editor/canvas.tsx` — imported `MarkerType`, `DefaultEdgeOptions`, `EdgeTypes`, `CanvasEdgeRenderer`; added `EDGE_TYPES = { canvasEdge: CanvasEdgeRenderer }` and `DEFAULT_EDGE_OPTIONS = { type: "canvasEdge", markerEnd: { type: ArrowClosed, color: "#f8fafc", width: 18, height: 18 } }` so every new connection from `onConnect` automatically uses the custom renderer with an arrow; mirrored the node `nodesRef`/`updateLabel` pattern with `edgesRef`/`updateEdgeLabel` and added local `editingEdgeId` state plus `startEdgeEditing`/`stopEdgeEditing`; threaded all four new values through the existing `NodeEditingContext.Provider`; `onPaneClick` now clears both `editingNodeId` and `editingEdgeId` so clicking blank canvas drops out of label-edit mode
  - No server calls — edge label updates flow through `useLiveblocksFlow`'s `onEdgesChange` pipeline (same pattern as node label/color)
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 15: Nodes Color Toolbar**
  - Extended `components/editor/node-editing-context.tsx` — `NodeEditingContextValue` now exposes `updateColor(nodeId, fill)` alongside `updateLabel`; same per-client editing-state + collaborative-mutation split as Feature 14
  - Created `components/editor/color-toolbar.tsx` — `ColorToolbar` wraps React Flow's `<NodeToolbar position={Position.Top} offset={12} className="nodrag nopan">` (React Flow keywords block node drag + canvas pan even though NodeToolbar mounts in the viewport portal); renders one `ColorSwatch` per `NODE_COLORS` entry inside a pill-shaped container (`rounded-full border border-surface-border bg-surface/95 backdrop-blur` — matches `ShapePanel` styling); container's `onMouseDown` stops bubbling as belt-and-suspenders so swatch interactions never reach the React Flow pan handler. Each swatch is a 20px circle whose `backgroundColor` is the fill; the swatch's paired text color is exposed via a `--swatch-text` CSS custom property (typed as `CSSProperties & Record<"--swatch-text", string>`) so Tailwind arbitrary values can read it: `hover:shadow-[0_0_4px_1px_var(--swatch-text)]` for the tight controlled glow, and `data-[active=true]:outline-2 data-[active=true]:outline-offset-2 data-[active=true]:outline-[var(--swatch-text)]` for the active ring; active swatches also show a small `h-1.5 w-1.5` inner dot in the text color so selection is unambiguous even at a glance. `onClick`/`onMouseDown` call `event.stopPropagation()` then `onSelect(color.fill)`
  - Updated `components/editor/canvas-node.tsx` — `CanvasNodeRenderer` now pulls `updateColor` from `useNodeEditing()` and renders `<ColorToolbar visible={!!selected} activeFill={data.color} onSelect={(fill) => updateColor(id, fill)} />` between `<NodeResizer>` and `<ShapeView>`; toolbar is only shown when the node is selected via `visible` prop on NodeToolbar
  - Updated `components/editor/canvas.tsx` — added a `updateColor(id, fill)` callback mirroring `updateLabel`: looks up the node via `nodesRef`, dispatches `onNodesChange([{ type: 'replace', id, item: { ...node, data: { ...node.data, color: fill } } }])` so Liveblocks Storage syncs the new fill to all clients; text color is derived automatically by `getNodeTextColor(data.color)` inside the node renderer, so a single `color` write flips both background and text in one update. `updateColor` is threaded into the existing `NodeEditingContext.Provider` value (memoized)
  - No server calls — all mutations flow through `useLiveblocksFlow`'s `onNodesChange` pipeline (same pattern as label editing and shape drops)
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 14: Node Resizing & Inline Label Editing**
  - Created `components/editor/node-editing-context.tsx` — `NodeEditingContext` exposes `editingNodeId` plus `startEditing`/`stopEditing`/`updateLabel` so editing state stays per-client (not synced via Liveblocks) while label mutations flow through the shared `onNodesChange` pipeline
  - Refactored `components/editor/canvas-node.tsx` — `ShapeView` now accepts `children` (centered overlay slot) instead of a `label` prop and renders the shape background as an `absolute inset-0` layer; cylinder children get an extra `pt-4` to clear the curved top; `CanvasNodeRenderer` now renders `<NodeResizer isVisible={selected} minWidth=80 minHeight=60 color="rgba(240,240,244,0.6)" handleStyle={…}>` plus an internal `LabelLayer`; static layer shows the label centered (or a `Double-click to label` placeholder at 40% opacity when empty) and binds `onDoubleClick={startEditing}`; editing layer renders a centered `<textarea>` with `nodrag nopan` classes (React Flow keywords that block node drag + canvas pan), syncs each keystroke via `updateLabel`, closes on `blur`, closes on `Escape` via `onKeyDown`, and stops mouse-event bubbling so single-clicks inside the textarea don't trigger node-drag
  - Updated `components/editor/canvas.tsx` — owns the local `editingNodeId` React state and a `nodesRef` mirror of the latest nodes array; `updateLabel(id, label)` looks up the node by id and dispatches `onNodesChange([{ type: 'replace', id, item: { ...node, data: { ...node.data, label } } }])` so Liveblocks Storage receives the new label and broadcasts to other clients; provides the editing context via `<NodeEditingContext.Provider>` wrapping `<ReactFlow>`; clicking the empty pane (`onPaneClick`) clears `editingNodeId` so deselecting also stops editing
  - `components/editor/shape-panel.tsx` unchanged — ghost preview already called `<ShapeView shape color />` with no label, which matches the new children-based API
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 13: Node Shape Rendering & Drag Preview**
  - Refactored `components/editor/canvas-node.tsx` — extracted `ShapeView` (renders the shape independently of React Flow `NodeProps`, accepts `shape`, `color`, optional `label`, optional `selected`); `CanvasNodeRenderer` now a thin wrapper over `ShapeView` that forwards `selected` from `NodeProps`; selection feedback is `filter: brightness(1.3)` applied to the shape's root wrapper so it brightens the rectangle/pill/circle backgrounds plus SVG fills uniformly (diamond/hexagon/cylinder)
  - Updated `components/editor/shape-panel.tsx` — each `ShapeButton` renders an offscreen ghost (`position: fixed; left: -9999px; top: -9999px;`, `opacity-70`, `pointer-events-none`, `aria-hidden`) sized to the shape's `defaultWidth`×`defaultHeight` with `<ShapeView shape={meta.shape} color={DEFAULT_NODE_COLOR.fill} />`; `onDragStart` calls `event.dataTransfer.setDragImage(ghostRef.current, defaultWidth/2, defaultHeight/2)` so the browser attaches the shape preview centered on the cursor; ghost is unmounted naturally with the panel, so the preview disappears on drop or cancel
  - Drop logic in `components/editor/canvas.tsx` unchanged — still uses `SHAPE_DRAG_MIME` payload + `screenToFlowPosition` + `onNodesChange([{ type: "add", item }])`; collaborative Liveblocks state remains the single source of truth
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 12: Shape Panel**
  - Extended `types/canvas.ts` — `CanvasNodeShape` now `"rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"`; added `NodeShapeMeta` + `NODE_SHAPES` array with default sizes (rectangle 180×90, diamond 170×140, circle 120×120, pill 200×70, cylinder 160×120, hexagon 170×100); added `NodeColor` + `NODE_COLORS` 8-pair palette (fills + text colors from `ui-context.md`); `DEFAULT_NODE_COLOR` = first entry (`#1F1F1F` / `#EDEDED`); `getNodeTextColor(fill)` derives paired text color; added `ShapeDragPayload` (`shape`, `width`, `height`) and `SHAPE_DRAG_MIME` = `"application/x-arch-ai-shape"`
  - Created `components/editor/canvas-node.tsx` — `CanvasNodeRenderer` (registered as the `canvasNode` type); rectangle uses `rounded-xl` div, circle + pill use `rounded-full`, diamond + hexagon + cylinder render as inline SVGs with `preserveAspectRatio="none"` so they fill the node's `style.width`/`style.height`; label color derived from `getNodeTextColor(data.color)`; no connection handles yet (deferred to edge-behavior feature)
  - Created `components/editor/shape-panel.tsx` — uses React Flow's `<Panel position="bottom-center">` to anchor a floating pill-shaped toolbar (`rounded-full border border-surface-border bg-surface/95 backdrop-blur`) inside the flow viewport; renders one draggable button per `NODE_SHAPES` entry with Lucide icons (`Square`, `Diamond`, `Circle`, `Pill`, `Cylinder`, `Hexagon`); each button sets `dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify({shape, width, height}))` and `effectAllowed = "move"` on `onDragStart`
  - Updated `components/editor/canvas.tsx` — split into outer `Canvas` (wraps `<ReactFlowProvider>`) + inner `CanvasInner` so `useReactFlow()` is available alongside `useLiveblocksFlow`; registered `nodeTypes = { canvasNode: CanvasNodeRenderer }`; `handleDragOver` calls `preventDefault` + sets `dropEffect = "move"`; `handleDrop` reads `SHAPE_DRAG_MIME` payload, calls `screenToFlowPosition({x: clientX, y: clientY})`, generates id as `${shape}-${Date.now()}-${counter}` (counter is `useRef(0)`, incremented per drop), builds a `CanvasNode` with `type: "canvasNode"`, `style: { width, height }` from the payload, `data: { label: "", color: DEFAULT_NODE_COLOR.fill, shape }`, and dispatches via `onNodesChange([{ type: "add", item: newNode }])` so Liveblocks syncs it; `<ShapePanel />` rendered as a child of `<ReactFlow>`
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 11: Base Canvas**
  - Created `types/canvas.ts` — `CanvasNodeShape` (`"rectangle" | "ellipse" | "diamond"`), `CanvasNodeData` (`label`, `color`, `shape`; extends `Record<string, unknown>` so it satisfies `@xyflow/react`'s `Node` data constraint), `CanvasNode = Node<CanvasNodeData, "canvasNode">`, `CanvasEdgeData` (empty, extends `Record<string, unknown>`), `CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">`
  - Created `components/editor/canvas.tsx` — client component, imports `@xyflow/react/dist/style.css` + `@liveblocks/react-ui/styles.css` + `@liveblocks/react-flow/styles.css`; calls `useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true, nodes: { initial: [] }, edges: { initial: [] } })` and renders `<ReactFlow>` with `connectionMode={ConnectionMode.Loose}`, `fitView`, `proOptions={{ hideAttribution: true }}`, plus `<Background variant={BackgroundVariant.Dots} />` and `<MiniMap />`
  - Created `components/editor/canvas-room.tsx` — client wrapper: `LiveblocksProvider authEndpoint="/api/liveblocks-auth"` → `RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}` → local `CanvasErrorBoundary` (class component, renders "Couldn't connect to the live canvas" message on error) → `ClientSideSuspense fallback={<CanvasFallback message="Connecting…" />}` → `<Canvas />`
  - Updated `components/editor/workspace.tsx` — replaced `CanvasPlaceholder` with `<CanvasRoom roomId={project.id} />`; `AiSidebar` overlay and `<ShareDialog />` continue to sit above the canvas
  - Server workspace page (`app/(editor)/editor/[projectId]/page.tsx`) untouched — still server-rendered behind `checkProjectAccess`
  - `npm run build` passes, 0 TypeScript errors; all 11 routes present in build output

- **Feature 10: Liveblocks Setup**
  - Installed `@liveblocks/node@3.19.1` (other Liveblocks packages were already present)
  - Updated `liveblocks.config.ts` — `Presence` now declares `cursor: { x: number; y: number } | null` and `isThinking: boolean`; `UserMeta.info` declares `name: string`, `avatar: string`, `color: string`
  - Created `lib/liveblocks.ts` — `getLiveblocksClient()` returns a lazily-instantiated `Liveblocks` SDK client cached on `globalThis` in development (lazy init avoids tripping the `LIVEBLOCKS_SECRET_KEY` check during Next.js page-data collection); exports `getCursorColorForUser(userId)` which deterministically hashes the Clerk user id into a fixed 12-color palette
  - Created `app/api/liveblocks-auth/route.ts` — POST handler reads `room` from the request body, treats it as the project id, runs `checkProjectAccess(projectId)` (401 unauthenticated / 403 denied / 400 if no room provided), fetches Clerk `currentUser()` for display name + image, ensures the Liveblocks room exists via `liveblocks.getOrCreateRoom(room, { defaultAccesses: ["room:write"] })`, then issues an access token via `prepareSession(userId, { userInfo: { name, avatar, color } })` + `session.allow(room, session.FULL_ACCESS)`
  - `npm run build` passes, 0 TypeScript errors; all 11 routes in build output (new `/api/liveblocks-auth` route present)

- **Feature 09: Share Dialog**
  - Created `lib/clerk-users.ts` — `enrichEmails(emails)` uses `clerkClient().users.getUserList({ emailAddress: emails })` to map emails to `{ displayName, imageUrl }`. Wrapped in try/catch — Clerk lookup failures fall back to email-only rows so the UI still renders.
  - Created `app/api/projects/[projectId]/collaborators/route.ts` — `GET` returns `{ isOwner, collaborators: [{ id, email, displayName?, imageUrl? }] }` (allowed for owner OR collaborator), enriches via Clerk; `POST` invites by email with regex validation, lowercased; 401/403/404 enforced server side, 409 on duplicate (Prisma P2002), 400 if owner tries to invite themselves
  - Created `app/api/projects/[projectId]/collaborators/[collaboratorId]/route.ts` — `DELETE` enforces owner check + collaborator-belongs-to-project check before deleting, returns 204
  - Extended `hooks/use-workspace.ts` — added `isShareDialogOpen`, `openShareDialog`, `closeShareDialog` to `WorkspaceContextValue`
  - Updated `components/editor/editor-shell.tsx` — owns share dialog open state, threads new context values into `WorkspaceContext.Provider`
  - Updated `components/editor/editor-navbar.tsx` — Share button `onClick={openShareDialog}` from `useWorkspace()`
  - Created `components/editor/share-dialog.tsx` — fetches collaborators on open; owners see invite form (email + submit) and per-row Remove buttons; collaborators see read-only list; "Copy link" button copies `${origin}/editor/${projectId}` with 2s "Copied!" feedback via Check icon; avatars use Clerk `imageUrl`, fall back to initial circle
  - Rendered `<ShareDialog />` inside `components/editor/workspace.tsx` so it sees the active project via `useWorkspace()`
  - `npm run build` passes, 0 TypeScript errors; all 10 routes in build output (two new `/api/projects/[projectId]/collaborators` routes)

- **Feature 08: Editor Workspace Shell**
  - Created `lib/project-access.ts` — `getCurrentClerkIdentity()` (returns `{userId, email}` from `auth()` + `currentUser()`) and `checkProjectAccess(projectId)` (returns `unauthenticated` | `denied` | `granted` with project info; grants access when user is owner OR has a `ProjectCollaborator` row for their primary email)
  - Created `components/editor/access-denied.tsx` — centered layout with lock icon, message, and "Back to projects" link to `/editor`
  - Created `hooks/use-workspace.ts` — `WorkspaceContext` exposing `project`, `setProject`, `isAiSidebarOpen`, `toggleAiSidebar`
  - Updated `components/editor/editor-shell.tsx` — owns workspace project state + AI sidebar open state, wraps tree with `WorkspaceContext.Provider` (nested inside existing `ProjectDialogsContext.Provider`)
  - Updated `components/editor/editor-navbar.tsx` — consumes `useWorkspace()`; when a project is active, shows the project name (truncated, left-aligned), a Share button, and an AI sidebar toggle (Sparkles icon, highlights with `bg-accent-dim` + `text-ai-text` when open); falls back to plain navbar otherwise
  - Updated `components/editor/project-sidebar.tsx` — project rows are now `next/link` to `/editor/[id]`; the row matching the current `usePathname()` segment gets `bg-elevated` + `aria-current="page"` highlight; fixed lingering `hover:text-state-error` → `hover:text-error` token name
  - Created `components/editor/workspace.tsx` — client component that on mount calls `setProject(project)` (cleanup → `null` on unmount); renders the canvas placeholder (full-bleed dark `bg-base` with centered "Canvas coming soon" copy) and a right-side slide-over `AiSidebar` placeholder (w-80, translate-x animation, header with Sparkles + close button)
  - Updated `app/(editor)/editor/[projectId]/page.tsx` — server component now calls `checkProjectAccess(projectId)` and dispatches: `unauthenticated` → `redirect("/sign-in")`, `denied` (missing OR not owner/collaborator) → `<AccessDenied />`, `granted` → `<Workspace project={result.project} />`
  - `npm run build` passes, 0 TypeScript errors; all 8 routes in build output

- **Feature 07: Wire Editor Home to Real Project API**
  - Created `lib/projects.ts` — `getOwnedProjects(userId)` and `getSharedProjects(email)` server helpers using Prisma
  - Converted `app/(editor)/layout.tsx` to an async server component; fetches owned + shared projects via `auth()` + `currentUser()` and passes them as props to `EditorShell`
  - Updated `components/editor/editor-shell.tsx` — accepts `ownedProjects`/`sharedProjects` props, threads them into `useProjectDialogs`
  - Replaced mock logic in `hooks/use-project-dialogs.ts` with real API calls: POST `/api/projects` (slug+suffix roomId aligned with project id, navigates to `/editor/[id]`), PATCH `/api/projects/[id]` + `router.refresh()`, DELETE + redirect to `/editor` if active workspace else refresh
  - Updated POST handler in `app/api/projects/route.ts` to accept optional `id` in body for slug-based room id
  - Updated `components/editor/project-dialogs.tsx` — create dialog shows room id preview
  - Updated `components/editor/project-sidebar.tsx` — uses `ownedProjects`/`sharedProjects` directly from context
  - Created `app/(editor)/editor/[projectId]/page.tsx` — workspace stub (server component, redirects to `/editor` if project not found)
  - `npm run build` passes, 0 TypeScript errors; all 8 routes in build output

- **Feature 06: Project API Routes**
  - Created `app/api/projects/route.ts` — GET (list by ownerId, ordered by createdAt desc) + POST (create with default name "Untitled Project"); both return 401 for unauthenticated requests
  - Created `app/api/projects/[projectId]/route.ts` — PATCH (rename, validates non-empty name) + DELETE (204 no content); both enforce owner check: 401 if unauthenticated, 403 if not owner, 404 if project not found
  - Added `serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"]` to `next.config.ts` to prevent Turbopack from bundling the Prisma runtime
  - Upgraded `prisma` CLI from v6.19.3 → v7.8.0 to align with `@prisma/client` v7; regenerated client; removed removed `url` from `schema.prisma` datasource block (now managed by `prisma.config.ts`); removed invalid `engine: "classic"` from `prisma.config.ts`
  - `npm run build` passes, 0 TypeScript errors; all four routes appear in build output

- **Feature 05: Prisma Data Models & Client**
  - Created `prisma/models/project.prisma` — `Project` (ownerId, name, description?, status enum DRAFT/ARCHIVED, canvasJsonPath?, timestamps, indexes on ownerId + createdAt) and `ProjectCollaborator` (projectId cascade, email, createdAt, unique on project/email, indexes on email + project/date)
  - Created `lib/prisma.ts` — cached singleton; branches on `DATABASE_URL` prefix: `prisma+postgres://` → `withAccelerate()` extension, otherwise `PrismaPg` adapter; cached on `globalThis` in development
  - Installed `@prisma/extension-accelerate`
  - Ran `prisma migrate dev --name init-projects`; migration applied and client generated to `app/generated/prisma`
  - `npm run build` passes, 0 TypeScript errors

- **Feature 04: Project Dialogs & Editor Home**
  - Created `hooks/use-project-dialogs.ts` — dedicated hook + React context (`ProjectDialogsContext`) managing dialog state, form state, loading state, and mock project data; exports `useProjectDialogs` and `useProjectDialogsContext`
  - Created `components/editor/project-dialogs.tsx` — three dialogs (Create with live slug preview, Rename with auto-focus + enter-to-submit, Delete with destructive confirm) using `EditorDialog`
  - Updated `components/editor/editor-shell.tsx` — wraps tree with `ProjectDialogsContext.Provider`, renders `<ProjectDialogs />` outside main layout, adds mobile backdrop scrim (z-10, `bg-black/50`, `md:hidden`) that closes sidebar on tap
  - Updated `components/editor/project-sidebar.tsx` — renders project list items (owned + shared tabs), hover-revealed Rename/Delete icon buttons (owned only, hidden on shared), New Project button wired to `openCreate`
  - Updated `app/(editor)/editor/page.tsx` — client component with heading, description, New Project button wired to `openCreate` via context
  - `npx tsc --noEmit`: 0 errors; ESLint: 0 errors

- **Feature 03: Auth (Clerk)**
  - Installed `@clerk/ui` and `@clerk/themes`
  - Created `proxy.ts` at project root — Next.js 16 proxy (formerly middleware), Clerk `clerkMiddleware` with `createRouteMatcher` using NEXT_PUBLIC_CLERK_SIGN_IN/SIGN_UP_URL env vars; protects everything by default
  - Updated `app/layout.tsx` — ClerkProvider wraps root layout with `@clerk/ui/themes` dark theme; appearance variables use CSS custom properties (no hardcoded colors)
  - Updated `app/page.tsx` — server component redirects: authenticated → /editor, unauthenticated → /sign-in
  - Created `app/(auth)/layout.tsx` — public layout group (no EditorShell)
  - Created `app/(auth)/sign-in/[[...sign-in]]/page.tsx` — two-panel layout: left (logo + tagline + feature list, `hidden lg:flex`), right (centered `<SignIn />`); no gradients, no hero sections
  - Created `app/(auth)/sign-up/[[...sign-up]]/page.tsx` — same two-panel layout with `<SignUp />`
  - Created `app/(editor)/layout.tsx` — protected group, wraps with EditorShell (proxy handles auth redirect)
  - Created `app/(editor)/editor/page.tsx` — placeholder editor content
  - Updated `components/editor/editor-navbar.tsx` — added `<UserButton />` to navbar right section
  - `npm run build` passes, 0 TypeScript errors

- **Feature 02: Editor Chrome**
  - Created `components/editor/editor-navbar.tsx` — fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose, left/center/right sections, bg-surface + border-surface-border
  - Created `components/editor/project-sidebar.tsx` — absolute-positioned slide-in panel, translateX animation, Projects header + close button, My Projects/Shared tabs with empty states, full-width New Project button
  - Created `components/editor/editor-dialog.tsx` — reusable dialog wrapper (title, description, footer, children) using project tokens (bg-elevated, rounded-3xl, border-surface-border)
  - TypeScript strict-mode: 0 errors

- **Feature 01: Design System**
  - Installed and configured shadcn/ui (Tailwind v4, components.json, default style)
  - Added Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea to components/ui/
  - Installed lucide-react, class-variance-authority, tailwindcss-animate,
    clsx, tailwind-merge, and all @radix-ui/* peer dependencies
  - Created lib/utils.ts with cn() helper (clsx + tailwind-merge)
  - Configured globals.css: full dark theme CSS variables, @theme inline mappings
    for both shadcn semantic tokens and project-specific tokens, base layer resets
  - TypeScript strict-mode type check: 0 errors

## In Progress

- None.

## Next Up

- (tbd)

## Open Questions

- None currently.

## Architecture Decisions

- shadcn/ui chosen as component library (see ui-context.md) — no custom design
  system, components live in components/ui/.
- Tailwind v4 CSS-variable-first approach: all theme tokens defined as CSS custom
  properties in globals.css and exposed to Tailwind via @theme inline.
- Dark-only theme: no light mode variant, all CSS variables set on :root with
  dark values directly (no .dark class toggling needed).
- tailwindcss-animate added as @plugin in globals.css to support dialog
  animate-in/animate-out utilities.
- @theme inline maps both shadcn semantic names (--background, --primary, etc.)
  and project-specific names (--color-brand, --color-copy-primary, etc.) so both
  sets of utility classes are available.

## Architecture Decisions (continued)

- Next.js 16 renames `middleware.ts` → `proxy.ts` at project root. Must export a default or `proxy` function. All Clerk middleware logic lives there.
- Clerk appearance API (v7 + @clerk/ui) uses `theme` (not `baseTheme`) and `colorForeground` / `colorInput` / `colorInputForeground` — not the deprecated `colorText`/`colorInputBackground` names.

## Session Notes

- Project uses Next.js 16.2.4, React 19.2.4, Tailwind v4, TypeScript strict mode.
- tsconfig paths: @/* → ./* (root-relative imports).
- Do NOT modify files in components/ui/ — they are shadcn-generated.
- Use cn() from @/lib/utils for all className merging.
- Use project token utilities (bg-base, bg-surface, text-copy-primary, etc.)
  not raw hex or zinc-* Tailwind classes.
