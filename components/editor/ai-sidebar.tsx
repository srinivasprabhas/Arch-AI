"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import {
  Bot,
  Download,
  FileText,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ChatRole = "user" | "assistant"

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend.",
  "Create a chat app architecture.",
  "Build a CI/CD pipeline.",
]

const TEXTAREA_MIN_HEIGHT = 72
const TEXTAREA_MAX_HEIGHT = 160

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
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
      <SidebarHeader onClose={onClose} />
      <SidebarTabs />
    </aside>
  )
}

function SidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-dim shrink-0">
          <Bot className="h-4 w-4 text-ai-text" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-copy-primary truncate">
            AI workspace
          </span>
          <span className="text-xs text-copy-muted truncate">
            Collaborate with ARC AI
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

function SidebarTabs() {
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
        <ArchitectTab />
      </TabsContent>

      <TabsContent
        value="specs"
        className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col"
      >
        <SpecsTab />
      </TabsContent>
    </Tabs>
  )
}

function ArchitectTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          role: "user",
          content: trimmed,
        },
      ])
      setDraft("")
    },
    [],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        submit(draft)
      }
    },
    [draft, submit],
  )

  const handleSend = useCallback(() => {
    submit(draft)
  }, [draft, submit])

  const handleStarter = useCallback(
    (prompt: string) => {
      submit(prompt)
    },
    [submit],
  )

  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 flex flex-col min-h-0">
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
        <div className="relative rounded-2xl border border-surface-border bg-surface focus-within:border-border-subtle transition-colors">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ARC AI to design something…"
            rows={1}
            className={cn(
              "block w-full resize-none bg-transparent px-3 py-3 pr-12",
              "text-sm text-copy-primary placeholder:text-copy-faint",
              "focus:outline-none",
            )}
            style={{
              minHeight: TEXTAREA_MIN_HEIGHT,
              maxHeight: TEXTAREA_MAX_HEIGHT,
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Send message"
            className={cn(
              "absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-xl",
              "bg-brand text-white transition-colors",
              "hover:bg-brand/90",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-copy-faint text-center">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  )
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
          Describe a system and ARC AI will draft an architecture on your canvas.
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

function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap wrap-break-word",
            "bg-accent-dim border-2 border-brand/50 text-copy-primary",
          )}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap wrap-break-word",
          "bg-elevated border border-surface-border text-ai-text",
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

function SpecsTab() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
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

      <DemoSpecCard />
    </div>
  )
}

function DemoSpecCard() {
  return (
    <div className="rounded-2xl border border-surface-border bg-elevated p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-subtle shrink-0">
          <FileText className="h-4 w-4 text-ai-text" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-copy-primary truncate">
            E-commerce platform spec
          </p>
          <p className="mt-1 text-xs text-copy-muted line-clamp-2">
            Microservices outline covering catalog, cart, checkout, and
            payments with event-driven order flow.
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled
        aria-label="Download spec"
        className={cn(
          "inline-flex items-center justify-center gap-2 w-full",
          "rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs font-medium",
          "text-copy-muted opacity-60 cursor-not-allowed",
        )}
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </button>
    </div>
  )
}
