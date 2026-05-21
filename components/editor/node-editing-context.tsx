"use client"

import { createContext, useContext } from "react"

export interface NodeEditingContextValue {
  editingNodeId: string | null
  startEditing: (nodeId: string) => void
  stopEditing: () => void
  updateLabel: (nodeId: string, label: string) => void
  updateColor: (nodeId: string, fill: string) => void
  editingEdgeId: string | null
  startEdgeEditing: (edgeId: string) => void
  stopEdgeEditing: () => void
  updateEdgeLabel: (edgeId: string, label: string) => void
}

export const NodeEditingContext =
  createContext<NodeEditingContextValue | null>(null)

export function useNodeEditing(): NodeEditingContextValue {
  const ctx = useContext(NodeEditingContext)
  if (!ctx) {
    throw new Error(
      "useNodeEditing must be used inside <NodeEditingContext.Provider>",
    )
  }
  return ctx
}
