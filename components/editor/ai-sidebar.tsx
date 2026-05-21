"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import {
  AlertTriangle,
  Bot,
  Check,
  Clock,
  Download,
  FileText,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import {
  useBroadcastEvent,
  useEventListener,
} from "@liveblocks/react/suspense"
import { useUser } from "@clerk/nextjs"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useWorkspace, type WorkspaceProject } from "@/hooks/use-workspace"
import {
  AI_CHAT_EVENT_KIND,
  AiChatMessageSchema,
  isAiGenerationActive,
  parseAiChatEvent,
  parseAiStatusEvent,
  type AiChatMessage,
  type AiChatRole,
  type AiStatusEvent,
} from "@/types/tasks"
import type { designAgentTask } from "@/src/trigger/design-agent"

const STARTER_PROMPTS = [
  "Design an e-commerce backend.",
  "Create a chat app architecture.",
  "Build a CI/CD pipeline.",
]

const TEXTAREA_MIN_HEIGHT = 72
const TEXTAREA_MAX_HEIGHT = 160
const AI_SENDER_NAME = "Arch AI"

interface ActiveRun {
  runId: string
  accessToken: string
}

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const { project } = useWorkspace()
  const [latestStatus, setLatestStatus] = useState<AiStatusEvent | null>(null)
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null)

  useEventListener(({ event }) => {
    const parsed = parseAiStatusEvent(event)
    if (parsed) setLatestStatus(parsed)
  })

  const liveStatusActive =
    latestStatus !== null && isAiGenerationActive(latestStatus.state)
  const isBusy = liveStatusActive || activeRun !== null

  return (
    <aside
      aria-label="AI workspace sidebar"
      className={cn(
        "absolute top-4 bottom-4 right-4 z-20 w-80 flex flex-col overflow-hidden",
        "bg-base/95 backdrop-blur border border-surface-border rounded-2xl shadow-2xl",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1.5rem)]",
      )}
    >
      <SidebarHeader onClose={onClose} isBusy={isBusy} />
      <SidebarTabs
        project={project}
        latestStatus={latestStatus}
        isBusy={isBusy}
        activeRun={activeRun}
        setActiveRun={setActiveRun}
      />
    </aside>
  )
}

function SidebarHeader({
  onClose,
  isBusy,
}: {
  onClose: () => void
  isBusy: boolean
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-accent-dim shrink-0">
          <Bot className="h-4 w-4 text-ai-text" />
          {isBusy && (
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-ai ring-2 ring-base"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-copy-primary truncate">
            AI workspace
          </span>
          <span className="text-xs text-copy-muted truncate">
            {isBusy ? "Arch AI is working…" : "Collaborate with Arch AI"}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close AI sidebar"
        className="p-1.5 rounded-xl text-copy-muted hover:text-copy-primary hover:bg-elevated transition-colors shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function SidebarTabs({
  project,
  latestStatus,
  isBusy,
  activeRun,
  setActiveRun,
}: {
  project: WorkspaceProject | null
  latestStatus: AiStatusEvent | null
  isBusy: boolean
  activeRun: ActiveRun | null
  setActiveRun: (run: ActiveRun | null) => void
}) {
  return (
    <Tabs defaultValue="architect" className="flex-1 flex flex-col min-h-0">
      <div className="px-3 pt-3 shrink-0">
        <TabsList className="grid grid-cols-2 w-full h-9 bg-surface border border-surface-border rounded-xl p-1">
          <TabsTrigger
            value="architect"
            className={cn(
              "rounded-lg text-xs font-medium transition-colors text-copy-muted",
              "data-[state=active]:bg-accent-dim data-[state=active]:text-brand data-[state=active]:shadow-none",
            )}
          >
            AI architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className={cn(
              "rounded-lg text-xs font-medium transition-colors text-copy-muted",
              "data-[state=active]:bg-accent-dim data-[state=active]:text-brand data-[state=active]:shadow-none",
            )}
          >
            Specs
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="architect"
        className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col"
      >
        <ArchitectTab
          project={project}
          latestStatus={latestStatus}
          isBusy={isBusy}
          activeRun={activeRun}
          setActiveRun={setActiveRun}
        />
      </TabsContent>

      <TabsContent
        value="specs"
        className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col"
      >
        <SpecsTab project={project} />
      </TabsContent>
    </Tabs>
  )
}

function StatusIndicator({ status }: { status: AiStatusEvent }) {
  const active = isAiGenerationActive(status.state)
  const isError = status.state === "error"
  const Icon = active ? Loader2 : isError ? AlertTriangle : Check
  const fallbackText =
    status.state === "start"
      ? "Designing your architecture…"
      : status.state === "processing"
        ? "Applying changes…"
        : status.state === "complete"
          ? "Done"
          : "Something went wrong"

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mx-3 mt-2 flex items-center gap-2 rounded-xl border px-3 py-2",
        "text-xs",
        active && "border-surface-border bg-accent-dim text-ai-text",
        !active &&
          !isError &&
          "border-surface-border bg-elevated text-copy-muted",
        isError && "border-error/40 bg-error/10 text-error",
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          active && "animate-spin",
        )}
      />
      <span className="truncate">{status.text?.trim() || fallbackText}</span>
    </div>
  )
}

interface DisplayChatMessage extends AiChatMessage {
  mine: boolean
}

function makeMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getDisplayName(
  user: ReturnType<typeof useUser>["user"],
): string {
  if (!user) return "Anonymous"
  return (
    user.fullName?.trim() ||
    user.firstName?.trim() ||
    user.username?.trim() ||
    user.primaryEmailAddress?.emailAddress ||
    "Anonymous"
  )
}

function extractSummary(output: unknown): string | null {
  if (!output || typeof output !== "object") return null
  const obj = output as Record<string, unknown>
  if (typeof obj.summary === "string" && obj.summary.trim()) {
    return obj.summary.trim()
  }
  return null
}

function ArchitectTab({
  project,
  latestStatus,
  isBusy,
  activeRun,
  setActiveRun,
}: {
  project: WorkspaceProject | null
  latestStatus: AiStatusEvent | null
  isBusy: boolean
  activeRun: ActiveRun | null
  setActiveRun: (run: ActiveRun | null) => void
}) {
  const { user } = useUser()
  const broadcast = useBroadcastEvent()
  const senderName = useMemo(() => getDisplayName(user), [user])

  const [messages, setMessages] = useState<DisplayChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRunIdRef = useRef<string | null>(null)

  useEffect(() => {
    activeRunIdRef.current = activeRun?.runId ?? null
  }, [activeRun?.runId])

  useEventListener(({ event }) => {
    const parsed = parseAiChatEvent(event)
    if (!parsed) return
    setMessages((prev) => {
      if (prev.some((m) => m.id === parsed.message.id)) return prev
      return [...prev, { ...parsed.message, mine: false }]
    })
  })

  const appendMessage = useCallback((message: AiChatMessage, mine: boolean) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, { ...message, mine }]
    })
  }, [])

  const broadcastChatMessage = useCallback(
    (
      role: AiChatRole,
      content: string,
      options: { sender?: string; id?: string; mine?: boolean } = {},
    ): AiChatMessage | null => {
      const candidate: AiChatMessage = {
        id: options.id ?? makeMessageId(),
        sender: options.sender ?? senderName,
        role,
        content,
        timestamp: Date.now(),
      }
      const validated = AiChatMessageSchema.safeParse(candidate)
      if (!validated.success) return null
      try {
        broadcast({ kind: AI_CHAT_EVENT_KIND, message: validated.data })
      } catch (err) {
        console.error("ai-chat broadcast failed", err)
        return null
      }
      appendMessage(validated.data, options.mine ?? role === "user")
      return validated.data
    },
    [broadcast, senderName, appendMessage],
  )

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const next = Math.min(
      Math.max(el.scrollHeight, TEXTAREA_MIN_HEIGHT),
      TEXTAREA_MAX_HEIGHT,
    )
    el.style.height = `${next}px`
  }, [])

  useLayoutEffect(() => {
    resizeTextarea()
  }, [draft, resizeTextarea])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  const submit = useCallback(
    async (text: string) => {
      if (isBusy) return
      const trimmed = text.trim()
      if (!trimmed) return
      if (!project) {
        setSendError("Open a project before sending a prompt.")
        return
      }

      const userMessage = broadcastChatMessage("user", trimmed, { mine: true })
      if (!userMessage) {
        setSendError("Couldn't send message — invalid content.")
        return
      }
      setDraft("")
      setSendError(null)

      try {
        const designRes = await fetch("/api/ai/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmed,
            roomId: project.id,
            projectId: project.id,
          }),
        })
        if (!designRes.ok) {
          throw new Error(`Design request failed (${designRes.status})`)
        }
        const designData = (await designRes.json()) as { runId?: string }
        if (!designData.runId) throw new Error("Missing runId in response")

        const tokenRes = await fetch("/api/ai/design/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: designData.runId }),
        })
        if (!tokenRes.ok) {
          throw new Error(`Token request failed (${tokenRes.status})`)
        }
        const tokenData = (await tokenRes.json()) as { token?: string }
        if (!tokenData.token) throw new Error("Missing token in response")

        setActiveRun({ runId: designData.runId, accessToken: tokenData.token })
      } catch (err) {
        console.error("Design trigger failed", err)
        broadcastChatMessage(
          "assistant",
          "I couldn't start the design agent. Please try again.",
          { sender: AI_SENDER_NAME },
        )
      }
    },
    [isBusy, project, broadcastChatMessage, setActiveRun],
  )

  const handleRunComplete = useCallback(
    (output: unknown) => {
      const runId = activeRunIdRef.current
      const summary = extractSummary(output) ?? "Design complete."
      broadcastChatMessage("assistant", summary, {
        sender: AI_SENDER_NAME,
        id: runId ? `run-${runId}-complete` : undefined,
      })
      setActiveRun(null)
    },
    [broadcastChatMessage, setActiveRun],
  )

  const handleRunFailed = useCallback(
    (message?: string) => {
      const runId = activeRunIdRef.current
      broadcastChatMessage(
        "assistant",
        message?.trim() || "Design generation failed. Please try again.",
        {
          sender: AI_SENDER_NAME,
          id: runId ? `run-${runId}-failed` : undefined,
        },
      )
      setActiveRun(null)
    },
    [broadcastChatMessage, setActiveRun],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        void submit(draft)
      }
    },
    [draft, submit],
  )

  const handleSend = useCallback(() => {
    void submit(draft)
  }, [draft, submit])

  const handleStarter = useCallback(
    (prompt: string) => {
      void submit(prompt)
    },
    [submit],
  )

  const isEmpty = messages.length === 0
  const sendDisabled = !draft.trim() || isBusy

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {activeRun && (
        <RunWatcher
          runId={activeRun.runId}
          accessToken={activeRun.accessToken}
          onComplete={handleRunComplete}
          onFailed={handleRunFailed}
        />
      )}
      {isBusy && latestStatus && <StatusIndicator status={latestStatus} />}

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
      >
        {isEmpty ? (
          <EmptyState onSelectPrompt={handleStarter} />
        ) : (
          <ChatMessages messages={messages} />
        )}
      </div>

      <div className="border-t border-surface-border p-3 shrink-0">
        {sendError && (
          <div
            role="alert"
            className="mb-2 flex items-center gap-2 rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-xs text-error"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{sendError}</span>
          </div>
        )}
        <div className="relative rounded-2xl border border-surface-border bg-surface focus-within:border-border-subtle transition-colors">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            placeholder={
              isBusy
                ? "Arch AI is working…"
                : "Ask Arch AI to design something…"
            }
            rows={1}
            className={cn(
              "block w-full resize-none bg-transparent px-3 py-3 pr-12",
              "text-sm text-copy-primary placeholder:text-copy-faint",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
            style={{
              minHeight: TEXTAREA_MIN_HEIGHT,
              maxHeight: TEXTAREA_MAX_HEIGHT,
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sendDisabled}
            aria-label={isBusy ? "Arch AI is working" : "Send message"}
            aria-busy={isBusy}
            className={cn(
              "absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-xl",
              "bg-brand text-white transition-colors",
              "hover:bg-brand/90",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-copy-faint text-center">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  )
}

const TERMINAL_FAILURE_STATUSES = new Set([
  "FAILED",
  "CANCELED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "TIMED_OUT",
  "EXPIRED",
  "INTERRUPTED",
])

function RunWatcher({
  runId,
  accessToken,
  onComplete,
  onFailed,
}: {
  runId: string
  accessToken: string
  onComplete: (output: unknown) => void
  onFailed: (message?: string) => void
}) {
  const { run, error } = useRealtimeRun<typeof designAgentTask>(runId, {
    accessToken,
  })
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    if (error) {
      handledRef.current = true
      onFailed(error.message)
      return
    }
    if (!run) return
    const status = run.status
    if (status === "COMPLETED") {
      handledRef.current = true
      onComplete(run.output)
      return
    }
    if (TERMINAL_FAILURE_STATUSES.has(status)) {
      handledRef.current = true
      onFailed(undefined)
    }
  }, [run, error, onComplete, onFailed])

  return null
}

function EmptyState({
  onSelectPrompt,
}: {
  onSelectPrompt: (prompt: string) => void
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-dim">
        <Bot className="h-6 w-6 text-ai-text" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-copy-primary">
          Start a conversation
        </p>
        <p className="text-xs text-copy-muted px-2">
          Describe a system and Arch AI will draft an architecture on your canvas.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className={cn(
              "w-full rounded-full bg-subtle px-3 py-2 text-xs text-brand text-left",
              "border border-surface-border hover:bg-elevated transition-colors",
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatMessages({ messages }: { messages: DisplayChatMessage[] }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  )
}

function formatTimestamp(value: number): string {
  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

function MessageBubble({ message }: { message: DisplayChatMessage }) {
  const time = formatTimestamp(message.timestamp)
  const isAssistant = message.role === "assistant"
  const isMine = !isAssistant && message.mine

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("flex flex-col gap-1 max-w-[85%]", isMine && "items-end")}>
        <div
          className={cn(
            "flex items-center gap-1.5 text-[11px] text-copy-faint px-1",
            isMine && "flex-row-reverse",
          )}
        >
          {isAssistant && <Bot className="h-3 w-3 text-ai-text shrink-0" />}
          <span
            className={cn(
              "font-medium truncate max-w-[140px]",
              isAssistant ? "text-ai-text" : "text-copy-muted",
            )}
          >
            {message.sender}
          </span>
          {time && <span>{time}</span>}
        </div>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap wrap-break-word",
            isMine && "bg-accent-dim border-2 border-brand/50 text-copy-primary",
            isAssistant &&
              "bg-ai/10 border border-ai/30 text-copy-primary",
            !isMine &&
              !isAssistant &&
              "bg-elevated border border-surface-border text-copy-primary",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}

interface SpecListItem {
  id: string
  filename: string
  createdAt: string
}

function formatSpecTimestamp(value: string): string {
  try {
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return value
  }
}

function downloadUrlFor(projectId: string, specId: string): string {
  return `/api/projects/${projectId}/specs/${specId}/download`
}

function SpecsTab({ project }: { project: WorkspaceProject | null }) {
  const [specs, setSpecs] = useState<SpecListItem[]>([])
  const [listStatus, setListStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle")
  const [previewSpec, setPreviewSpec] = useState<SpecListItem | null>(null)

  const loadSpecs = useCallback(async () => {
    if (!project) {
      setSpecs([])
      setListStatus("idle")
      return
    }
    setListStatus("loading")
    try {
      const res = await fetch(`/api/projects/${project.id}/specs`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error(`Failed to load specs (${res.status})`)
      const data = (await res.json()) as { specs?: SpecListItem[] }
      setSpecs(Array.isArray(data.specs) ? data.specs : [])
      setListStatus("ready")
    } catch (err) {
      console.error("spec list load failed", err)
      setSpecs([])
      setListStatus("error")
    }
  }, [project])

  useEffect(() => {
    void loadSpecs()
  }, [loadSpecs])

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 pt-4 pb-3 shrink-0 flex flex-col gap-3">
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center gap-2 w-full",
            "rounded-xl bg-ai px-3 py-2.5 text-sm font-medium text-white",
            "hover:bg-ai/90 transition-colors",
          )}
        >
          <Sparkles className="h-4 w-4" />
          Generate Spec
        </button>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-copy-muted uppercase tracking-wide">
            Specs
          </span>
          <button
            type="button"
            onClick={() => void loadSpecs()}
            disabled={!project || listStatus === "loading"}
            className={cn(
              "text-[11px] text-copy-faint hover:text-copy-primary transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {listStatus === "loading" ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-4 pb-4">
        <SpecList
          specs={specs}
          status={listStatus}
          hasProject={!!project}
          onSelect={(spec) => setPreviewSpec(spec)}
        />
      </ScrollArea>

      <SpecPreviewDialog
        projectId={project?.id ?? null}
        spec={previewSpec}
        onClose={() => setPreviewSpec(null)}
      />
    </div>
  )
}

function SpecList({
  specs,
  status,
  hasProject,
  onSelect,
}: {
  specs: SpecListItem[]
  status: "idle" | "loading" | "ready" | "error"
  hasProject: boolean
  onSelect: (spec: SpecListItem) => void
}) {
  if (!hasProject) {
    return (
      <p className="text-xs text-copy-muted px-1 py-4">
        Open a project to see its specs.
      </p>
    )
  }
  if (status === "loading" && specs.length === 0) {
    return (
      <div className="flex items-center gap-2 px-1 py-4 text-xs text-copy-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading specs…
      </div>
    )
  }
  if (status === "error") {
    return (
      <div className="flex items-center gap-2 px-1 py-4 text-xs text-error">
        <AlertTriangle className="h-3.5 w-3.5" />
        Couldn&apos;t load specs.
      </div>
    )
  }
  if (specs.length === 0) {
    return (
      <p className="text-xs text-copy-muted px-1 py-4">
        No specs yet. Generate one from the canvas to see it here.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {specs.map((spec) => (
        <li key={spec.id}>
          <button
            type="button"
            onClick={() => onSelect(spec)}
            className={cn(
              "w-full text-left rounded-xl border border-surface-border bg-elevated",
              "px-3 py-2.5 flex items-start gap-3",
              "hover:bg-subtle hover:border-border-subtle transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-subtle shrink-0">
              <FileText className="h-3.5 w-3.5 text-ai-text" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-copy-primary truncate">
                {spec.filename}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-copy-faint">
                <Clock className="h-3 w-3" />
                {formatSpecTimestamp(spec.createdAt)}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}

function SpecPreviewDialog({
  projectId,
  spec,
  onClose,
}: {
  projectId: string | null
  spec: SpecListItem | null
  onClose: () => void
}) {
  const [content, setContent] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  )

  useEffect(() => {
    if (!spec || !projectId) {
      setContent(null)
      setStatus("idle")
      return
    }
    let cancelled = false
    setStatus("loading")
    setContent(null)
    void (async () => {
      try {
        const res = await fetch(downloadUrlFor(projectId, spec.id), {
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Failed to load spec (${res.status})`)
        const text = await res.text()
        if (cancelled) return
        setContent(text)
        setStatus("ready")
      } catch (err) {
        if (cancelled) return
        console.error("spec content load failed", err)
        setStatus("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [projectId, spec])

  const handleDownload = useCallback(() => {
    if (!projectId || !spec) return
    const url = downloadUrlFor(projectId, spec.id)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.rel = "noopener"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }, [projectId, spec])

  const open = !!spec && !!projectId

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className={cn(
          "max-w-3xl w-[92vw] gap-0 p-0",
          "bg-base border-surface-border text-copy-primary",
          "max-h-[85vh] grid grid-rows-[auto_minmax(0,1fr)_auto]",
        )}
      >
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-surface-border">
          <DialogTitle className="truncate pr-8 text-copy-primary">
            {spec?.filename ?? "Spec preview"}
          </DialogTitle>
          <DialogDescription className="text-xs text-copy-muted">
            {spec ? formatSpecTimestamp(spec.createdAt) : ""}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 px-5 py-4">
          <SpecPreviewBody status={status} content={content} />
        </ScrollArea>

        <DialogFooter className="px-5 py-3 border-t border-surface-border sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-surface-border bg-surface text-copy-primary hover:bg-elevated hover:text-copy-primary"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={!spec || !projectId}
            className="bg-brand text-white hover:bg-brand/90"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SpecPreviewBody({
  status,
  content,
}: {
  status: "idle" | "loading" | "ready" | "error"
  content: string | null
}) {
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-copy-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading spec…
      </div>
    )
  }
  if (status === "error") {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-error">
        <AlertTriangle className="h-4 w-4" />
        Couldn&apos;t load this spec.
      </div>
    )
  }
  if (!content || !content.trim()) {
    return (
      <p className="py-12 text-center text-sm text-copy-muted">
        This spec is empty.
      </p>
    )
  }
  return <SpecMarkdown source={content} />
}

function SpecMarkdown({ source }: { source: string }) {
  const blocks = useMemo(() => parseMarkdownBlocks(source), [source])
  return (
    <div className="text-sm text-copy-primary leading-relaxed space-y-3">
      {blocks.map((block, i) => (
        <MarkdownBlock key={i} block={block} />
      ))}
    </div>
  )
}

type MdBlock =
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "code"; lang: string | null; text: string }
  | { kind: "hr" }
  | { kind: "blockquote"; text: string }

function parseMarkdownBlocks(source: string): MdBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n")
  const blocks: MdBlock[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === "") {
      i++
      continue
    }
    const fence = line.match(/^```\s*(\S+)?\s*$/)
    if (fence) {
      const lang = fence[1] ?? null
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      blocks.push({ kind: "code", lang, text: buf.join("\n") })
      continue
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        text: heading[2].trim(),
      })
      i++
      continue
    }
    if (/^\s*([-*+])\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*([-*+])\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+])\s+/, ""))
        i++
      }
      blocks.push({ kind: "ul", items })
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""))
        i++
      }
      blocks.push({ kind: "ol", items })
      continue
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ kind: "hr" })
      i++
      continue
    }
    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""))
        i++
      }
      blocks.push({ kind: "blockquote", text: buf.join(" ") })
      continue
    }
    const buf: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*([-*+])\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    blocks.push({ kind: "paragraph", text: buf.join(" ") })
  }
  return blocks
}

function MarkdownBlock({ block }: { block: MdBlock }) {
  switch (block.kind) {
    case "heading": {
      const sizes: Record<number, string> = {
        1: "text-xl font-semibold mt-2",
        2: "text-lg font-semibold mt-2",
        3: "text-base font-semibold mt-1",
        4: "text-sm font-semibold",
        5: "text-sm font-medium",
        6: "text-xs font-medium uppercase tracking-wide text-copy-muted",
      }
      const cls = sizes[block.level]
      const content = renderInline(block.text)
      if (block.level === 1) return <h1 className={cls}>{content}</h1>
      if (block.level === 2) return <h2 className={cls}>{content}</h2>
      if (block.level === 3) return <h3 className={cls}>{content}</h3>
      if (block.level === 4) return <h4 className={cls}>{content}</h4>
      if (block.level === 5) return <h5 className={cls}>{content}</h5>
      return <h6 className={cls}>{content}</h6>
    }
    case "paragraph":
      return <p className="text-copy-primary">{renderInline(block.text)}</p>
    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-1 text-copy-primary marker:text-copy-faint">
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      )
    case "ol":
      return (
        <ol className="list-decimal pl-5 space-y-1 text-copy-primary marker:text-copy-faint">
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ol>
      )
    case "code":
      return (
        <pre className="rounded-lg border border-surface-border bg-surface px-3 py-2 overflow-x-auto text-xs text-copy-primary">
          <code>{block.text}</code>
        </pre>
      )
    case "hr":
      return <hr className="border-surface-border" />
    case "blockquote":
      return (
        <blockquote className="border-l-2 border-surface-border pl-3 text-copy-muted italic">
          {renderInline(block.text)}
        </blockquote>
      )
  }
}

function renderInline(text: string): ReactNode {
  const tokens: ReactNode[] = []
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith("`")) {
      tokens.push(
        <code
          key={key++}
          className="rounded bg-surface px-1 py-0.5 text-[0.85em] text-ai-text"
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith("**")) {
      tokens.push(
        <strong key={key++} className="font-semibold text-copy-primary">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith("*")) {
      tokens.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      )
    } else if (token.startsWith("[")) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        tokens.push(
          <a
            key={key++}
            href={link[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline underline-offset-2 hover:text-brand/80"
          >
            {link[1]}
          </a>,
        )
      } else {
        tokens.push(token)
      }
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex))
  }
  return <>{tokens}</>
}
