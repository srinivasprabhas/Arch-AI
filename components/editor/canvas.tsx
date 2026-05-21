"use client"

import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
} from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import {
  useCanRedo,
  useCanUndo,
  useEventListener,
  useRedo,
  useUndo,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense"

import { CanvasControlBar } from "@/components/editor/canvas-control-bar"
import { CanvasCursors } from "@/components/editor/canvas-cursors"
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge"
import { CanvasMiniMapNode } from "@/components/editor/canvas-mini-map-node"
import { CanvasNodeRenderer } from "@/components/editor/canvas-node"
import { CanvasPresenceAvatars } from "@/components/editor/canvas-presence-avatars"
import {
  NodeEditingContext,
  type NodeEditingContextValue,
} from "@/components/editor/node-editing-context"
import { ShapePanel } from "@/components/editor/shape-panel"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useWorkspace } from "@/hooks/use-workspace"
import {
  DEFAULT_NODE_COLOR,
  SHAPE_DRAG_MIME,
  type CanvasEdge,
  type CanvasNode,
  type ShapeDragPayload,
} from "@/types/canvas"
import { parseAiStatusEvent } from "@/types/tasks"

const NODE_TYPES: NodeTypes = {
  canvasNode: CanvasNodeRenderer,
}

const EDGE_TYPES: EdgeTypes = {
  canvasEdge: CanvasEdgeRenderer,
}

const EDGE_ARROW_COLOR = "#f8fafc"
const PROJECT_SIDEBAR_WIDTH = 288
const AI_SIDEBAR_WIDTH = 320
const AI_SIDEBAR_RIGHT_INSET = 16
const AI_SIDEBAR_GAP = 8
const AI_SIDEBAR_TOTAL_OFFSET =
  AI_SIDEBAR_WIDTH + AI_SIDEBAR_RIGHT_INSET + AI_SIDEBAR_GAP

const DEFAULT_EDGE_OPTIONS: DefaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: EDGE_ARROW_COLOR,
    width: 18,
    height: 18,
  },
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })
  const reactFlow = useReactFlow()
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = reactFlow
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const updateMyPresence = useUpdateMyPresence()
  const {
    project,
    isProjectSidebarOpen,
    isAiSidebarOpen,
    isStarterTemplatesOpen,
    closeStarterTemplates,
    setCanvasSaveStatus,
  } = useWorkspace()
  const nodeCounterRef = useRef(0)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null)

  const startEditing = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId)
    setEditingEdgeId(null)
  }, [])

  const stopEditing = useCallback(() => {
    setEditingNodeId(null)
  }, [])

  const startEdgeEditing = useCallback((edgeId: string) => {
    setEditingEdgeId(edgeId)
    setEditingNodeId(null)
  }, [])

  const stopEdgeEditing = useCallback(() => {
    setEditingEdgeId(null)
  }, [])

  const nodesRef = useRef(nodes)
  nodesRef.current = nodes

  const edgesRef = useRef(edges)
  edgesRef.current = edges

  const updateLabel = useCallback(
    (nodeId: string, label: string) => {
      const node = nodesRef.current.find((n) => n.id === nodeId)
      if (!node) return
      const next: CanvasNode = {
        ...node,
        data: { ...node.data, label },
      }
      onNodesChange([{ type: "replace", id: nodeId, item: next }])
    },
    [onNodesChange],
  )

  const updateColor = useCallback(
    (nodeId: string, fill: string) => {
      const node = nodesRef.current.find((n) => n.id === nodeId)
      if (!node) return
      const next: CanvasNode = {
        ...node,
        data: { ...node.data, color: fill },
      }
      onNodesChange([{ type: "replace", id: nodeId, item: next }])
    },
    [onNodesChange],
  )

  const updateEdgeLabel = useCallback(
    (edgeId: string, label: string) => {
      const edge = edgesRef.current.find((e) => e.id === edgeId)
      if (!edge) return
      const next: CanvasEdge = {
        ...edge,
        data: { ...(edge.data ?? {}), label },
      }
      onEdgesChange([{ type: "replace", id: edgeId, item: next }])
    },
    [onEdgesChange],
  )

  const editingValue = useMemo<NodeEditingContextValue>(
    () => ({
      editingNodeId,
      startEditing,
      stopEditing,
      updateLabel,
      updateColor,
      editingEdgeId,
      startEdgeEditing,
      stopEdgeEditing,
      updateEdgeLabel,
    }),
    [
      editingNodeId,
      startEditing,
      stopEditing,
      updateLabel,
      updateColor,
      editingEdgeId,
      startEdgeEditing,
      stopEdgeEditing,
      updateEdgeLabel,
    ],
  )

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 })
  }, [zoomIn])

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 })
  }, [zoomOut])

  const handleFitView = useCallback(() => {
    fitView({ duration: 200 })
  }, [fitView])

  // When the design agent finishes a run, broadcast `ai-status` "complete"
  // arrives on the same WebSocket as the Storage updates mutateFlow wrote;
  // a small tail lets stragglers land before we measure bounds for fitView.
  const fitViewTimerRef = useRef<number | null>(null)
  useEventListener(({ event }) => {
    const parsed = parseAiStatusEvent(event)
    if (!parsed || parsed.state !== "complete") return
    if (fitViewTimerRef.current !== null) {
      window.clearTimeout(fitViewTimerRef.current)
    }
    fitViewTimerRef.current = window.setTimeout(() => {
      fitViewTimerRef.current = null
      requestAnimationFrame(() => {
        fitView({ duration: 400, padding: 0.2 })
      })
    }, 250)
  })
  useEffect(() => {
    return () => {
      if (fitViewTimerRef.current !== null) {
        window.clearTimeout(fitViewTimerRef.current)
      }
    }
  }, [])

  const handleDeleteSelection = useCallback(() => {
    if (editingNodeId || editingEdgeId) return

    const selectedNodes = reactFlow
      .getNodes()
      .filter((n): n is CanvasNode => Boolean(n.selected))
    const selectedEdges = reactFlow
      .getEdges()
      .filter((e): e is CanvasEdge => Boolean(e.selected))

    if (selectedNodes.length === 0 && selectedEdges.length === 0) return

    onDelete({ nodes: selectedNodes, edges: selectedEdges })
  }, [reactFlow, onDelete, editingNodeId, editingEdgeId])

  useKeyboardShortcuts({
    reactFlow,
    onUndo: undo,
    onRedo: redo,
    onDelete: handleDeleteSelection,
  })

  const projectId = project?.id ?? ""
  const loadAttemptedRef = useRef(false)

  useEffect(() => {
    if (!projectId) return
    if (loadAttemptedRef.current) return
    loadAttemptedRef.current = true

    if (nodesRef.current.length > 0 || edgesRef.current.length > 0) return

    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`)
        if (!res.ok) return
        const payload = (await res.json()) as {
          canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null
        }
        if (cancelled || !payload.canvas) return
        if (nodesRef.current.length > 0 || edgesRef.current.length > 0) return

        const savedEdges = payload.canvas.edges
        const savedNodes = payload.canvas.nodes
        if (savedEdges.length > 0) {
          onEdgesChange(savedEdges.map((item) => ({ type: "add", item })))
        }
        if (savedNodes.length > 0) {
          onNodesChange(savedNodes.map((item) => ({ type: "add", item })))
        }
      } catch (err) {
        console.error("Canvas load failed", err)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [projectId, onNodesChange, onEdgesChange])

  const saveStatus = useCanvasAutosave({
    projectId,
    nodes,
    edges,
    enabled: !!projectId,
  })

  useEffect(() => {
    setCanvasSaveStatus(saveStatus)
  }, [saveStatus, setCanvasSaveStatus])

  useEffect(() => {
    return () => {
      setCanvasSaveStatus("idle")
    }
  }, [setCanvasSaveStatus])

  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      const currentNodes = nodesRef.current
      const currentEdges = edgesRef.current

      const newNodes: CanvasNode[] = template.nodes.map((n) => ({
        ...n,
        position: { ...n.position },
        style: n.style ? { ...n.style } : undefined,
        data: { ...n.data },
      }))
      const newEdges: CanvasEdge[] = template.edges.map((e) => ({
        ...e,
        data: e.data ? { ...e.data } : {},
      }))

      onEdgesChange([
        ...currentEdges.map((e) => ({ type: "remove" as const, id: e.id })),
        ...newEdges.map((item) => ({ type: "add" as const, item })),
      ])
      onNodesChange([
        ...currentNodes.map((n) => ({ type: "remove" as const, id: n.id })),
        ...newNodes.map((item) => ({ type: "add" as const, item })),
      ])

      setEditingNodeId(null)
      setEditingEdgeId(null)

      requestAnimationFrame(() => {
        fitView({ duration: 400, padding: 0.2 })
      })
    },
    [onNodesChange, onEdgesChange, fitView],
  )

  const handlePointerMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const cursor = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      updateMyPresence({ cursor })
    },
    [screenToFlowPosition, updateMyPresence],
  )

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const raw = event.dataTransfer.getData(SHAPE_DRAG_MIME)
      if (!raw) return

      let payload: ShapeDragPayload
      try {
        payload = JSON.parse(raw) as ShapeDragPayload
      } catch {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      nodeCounterRef.current += 1
      const id = `${payload.shape}-${Date.now()}-${nodeCounterRef.current}`

      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position,
        style: { width: payload.width, height: payload.height },
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR.fill,
          shape: payload.shape,
        },
      }

      onNodesChange([{ type: "add", item: newNode }])
    },
    [screenToFlowPosition, onNodesChange],
  )

  return (
    <NodeEditingContext.Provider value={editingValue}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onPaneClick={() => {
          stopEditing()
          stopEdgeEditing()
        }}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={null}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <CanvasCursors />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap
          bgColor="var(--bg-surface)"
          maskColor="rgba(8, 8, 9, 0.6)"
          nodeColor={(node) => (node as CanvasNode).data.color}
          nodeStrokeColor="var(--border-subtle)"
          nodeStrokeWidth={2}
          nodeComponent={CanvasMiniMapNode}
          pannable
          zoomable
          style={{
            width: 140,
            height: 96,
            marginRight: 16 + (isAiSidebarOpen ? AI_SIDEBAR_TOTAL_OFFSET : 0),
            transition: "margin-right 300ms ease-in-out",
            border: "1px solid var(--border-default)",
            borderRadius: "0.75rem",
            overflow: "hidden",
          }}
        />
        <CanvasControlBar
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          leftOffset={isProjectSidebarOpen ? PROJECT_SIDEBAR_WIDTH : 0}
        />
        <ShapePanel />
        <CanvasPresenceAvatars
          rightOffset={isAiSidebarOpen ? AI_SIDEBAR_TOTAL_OFFSET : 0}
        />
      </ReactFlow>
      <StarterTemplatesModal
        open={isStarterTemplatesOpen}
        onClose={closeStarterTemplates}
        onImport={importTemplate}
      />
    </NodeEditingContext.Provider>
  )
}
