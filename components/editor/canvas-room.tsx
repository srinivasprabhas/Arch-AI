"use client"

import { Component, type ReactNode } from "react"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"

import { Canvas } from "@/components/editor/canvas"

interface CanvasRoomProps {
  roomId: string
}

export function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <CanvasErrorBoundary>
          <ClientSideSuspense fallback={<CanvasFallback message="Connecting…" />}>
            <Canvas />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function CanvasFallback({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-xs text-copy-faint">{message}</p>
    </div>
  )
}

interface CanvasErrorBoundaryState {
  hasError: boolean
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error("Canvas connection error", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center px-6">
          <div className="flex max-w-sm flex-col items-center gap-2 text-center">
            <p className="text-sm text-copy-primary">
              Couldn&apos;t connect to the live canvas.
            </p>
            <p className="text-xs text-copy-muted">
              Check your connection and refresh the page to try again.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
