"use client"

import { Component, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"

import { Canvas } from "@/components/editor/canvas"

interface CanvasRoomProps {
  roomId: string
  children?: ReactNode
}

export function CanvasRoom({ roomId, children }: CanvasRoomProps) {
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
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function CanvasFallback({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-center gap-3 text-[#F3F4F6]">
        <Loader2 className="h-5 w-5 animate-spin text-[#8B5CF6]" />
        <p className="text-lg font-medium">{message}</p>
      </div>
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
