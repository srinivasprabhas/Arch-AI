"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, Download, Loader2 } from "lucide-react"

import { CanvasPreview } from "@/components/dashboard/canvas-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/hooks/use-workspace"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import { cn } from "@/lib/utils"

const EXPORT_WIDTH = 1280
const EXPORT_HEIGHT = 720

interface ExportImageDialogProps {
  open: boolean
  onOpenChange: (next: boolean) => void
  projectName: string
}

export function ExportImageDialog({
  open,
  onOpenChange,
  projectName,
}: ExportImageDialogProps) {
  const { project } = useWorkspace()
  const projectId = project?.id ?? null

  const [canvas, setCanvas] = useState<{
    nodes: CanvasNode[]
    edges: CanvasEdge[]
  } | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !projectId) return
    let cancelled = false
    setStatus("loading")
    setPngDataUrl(null)
    setCopied(false)
    void (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Canvas load failed (${res.status})`)
        const data = (await res.json()) as {
          canvas: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null
        }
        if (cancelled) return
        setCanvas(data.canvas ?? { nodes: [], edges: [] })
        setStatus("ready")
      } catch (err) {
        if (cancelled) return
        console.error("Export image load failed", err)
        setStatus("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, projectId])

  useEffect(() => {
    if (status !== "ready" || !canvas) return
    const container = svgRef.current
    if (!container) return
    const svg = container.querySelector("svg")
    if (!svg) return

    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
    clone.setAttribute("width", String(EXPORT_WIDTH))
    clone.setAttribute("height", String(EXPORT_HEIGHT))
    const serialized = new XMLSerializer().serializeToString(clone)
    const svgBlob = new Blob([serialized], {
      type: "image/svg+xml;charset=utf-8",
    })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const cnv = document.createElement("canvas")
      cnv.width = EXPORT_WIDTH
      cnv.height = EXPORT_HEIGHT
      const ctx = cnv.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(url)
        return
      }
      ctx.fillStyle = "#0F0F12"
      ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)
      ctx.drawImage(img, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT)
      try {
        setPngDataUrl(cnv.toDataURL("image/png"))
      } catch (err) {
        console.error("Canvas toDataURL failed", err)
      }
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [canvas, status])

  const handleCopy = useCallback(async () => {
    if (!pngDataUrl) return
    try {
      const blob = await (await fetch(pngDataUrl)).blob()
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ])
      } else {
        await navigator.clipboard.writeText(pngDataUrl)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy image failed", err)
    }
  }, [pngDataUrl])

  const handleDownload = useCallback(() => {
    if (!pngDataUrl) return
    const safeName = projectName.replace(/[\\/:*?"<>|\r\n]+/g, "-").trim() || "canvas"
    const anchor = document.createElement("a")
    anchor.href = pngDataUrl
    anchor.download = `${safeName}.png`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }, [pngDataUrl, projectName])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl w-[92vw] rounded-2xl",
          "border border-[#2E2E36] bg-[#18181C] text-[#F3F4F6]",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-[#F3F4F6]">Export image</DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            Preview of your canvas. Copy to clipboard or download as PNG.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-[#2E2E36] bg-[#0F0F12] overflow-hidden">
          <div className="aspect-[16/9] w-full" ref={svgRef}>
            {status === "loading" && (
              <div className="h-full w-full grid place-items-center text-[#9CA3AF]">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {status === "ready" && canvas && (
              <CanvasPreview
                nodes={canvas.nodes}
                edges={canvas.edges}
                width={EXPORT_WIDTH}
                height={EXPORT_HEIGHT}
                className="block h-full w-full"
              />
            )}
            {status === "error" && (
              <div className="h-full w-full grid place-items-center text-sm text-[#EF4444]">
                Couldn&apos;t load the canvas.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#2E2E36] bg-transparent text-[#F3F4F6] hover:bg-[#23232A] hover:text-[#F3F4F6]"
          >
            Close
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!pngDataUrl}
            className="border-[#2E2E36] bg-transparent text-[#F3F4F6] hover:bg-[#23232A] hover:text-[#F3F4F6]"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            type="button"
            onClick={handleCopy}
            disabled={!pngDataUrl}
            className="bg-[#8B5CF6] text-white hover:bg-[#A78BFA] active:bg-[#7C3AED]"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
