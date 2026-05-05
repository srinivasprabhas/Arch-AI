"use client"

import { useEffect, useState } from "react"
import { Users, Zap, FileText } from "lucide-react"

// ─── Architecture diagram data ────────────────────────────────────────────────

const NODES = [
  { id: "client", label: "Web Client",   cx: 85,  cy: 95,  w: 82 },
  { id: "api",    label: "API Gateway",  cx: 230, cy: 48,  w: 88 },
  { id: "svc",    label: "Auth Service", cx: 230, cy: 145, w: 90 },
  { id: "db",     label: "Postgres",     cx: 375, cy: 72,  w: 76 },
  { id: "cache",  label: "Redis",        cx: 375, cy: 158, w: 60 },
]

const NODE_H = 28

// Each edge: [x1,y1] → [x2,y2], plus an animation delay in seconds
const EDGES = [
  { x1: 85  + 41, y1: 95,  x2: 230 - 44, y2: 48,  delay: 0.55 },
  { x1: 85  + 41, y1: 95,  x2: 230 - 45, y2: 145, delay: 0.70 },
  { x1: 230 + 44, y1: 48,  x2: 375 - 38, y2: 72,  delay: 0.90 },
  { x1: 230 + 45, y1: 145, x2: 375 - 38, y2: 72,  delay: 1.05 },
  { x1: 230 + 45, y1: 145, x2: 375 - 30, y2: 158, delay: 1.20 },
]

// ─── Feature list ─────────────────────────────────────────────────────────────

const FEATURES = [
  { Icon: Users,    label: "Real-time collaborative canvas" },
  { Icon: Zap,      label: "AI-powered architecture generation" },
  { Icon: FileText, label: "Technical specification export" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function ArchDiagram() {
  return (
    <>
      <style>{`
        @keyframes arch-edge-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes arch-node-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .arch-node {
          cursor: default;
          transform-box: fill-box;
          transform-origin: center;
        }
        .arch-node rect {
          transition: stroke 0.18s, fill 0.18s;
        }
        .arch-node text {
          transition: fill 0.18s;
        }
        .arch-node:hover rect {
          stroke: var(--accent-primary);
          fill: color-mix(in srgb, var(--accent-primary) 8%, var(--bg-elevated));
        }
        .arch-node:hover text {
          fill: var(--text-primary);
        }
      `}</style>

      <svg viewBox="0 0 460 200" className="w-full" aria-hidden="true">
        {/* Edges — draw in after nodes appear */}
        {EDGES.map((e, i) => (
          <line
            key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="var(--accent-primary)"
            strokeOpacity="0.3"
            strokeWidth="1.5"
            strokeDasharray="300"
            strokeDashoffset="300"
            style={{
              animation: "arch-edge-draw 0.45s ease forwards",
              animationDelay: `${e.delay}s`,
            }}
          />
        ))}

        {/* Nodes — fade in sequentially */}
        {NODES.map((n, i) => (
          <g
            key={n.id}
            className="arch-node"
            style={{
              opacity: 0,
              animation: "arch-node-in 0.25s ease forwards",
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <rect
              x={n.cx - n.w / 2}
              y={n.cy - NODE_H / 2}
              width={n.w}
              height={NODE_H}
              rx="6"
              fill="var(--bg-elevated)"
              stroke="var(--border-default)"
              strokeWidth="1"
            />
            <text
              x={n.cx}
              y={n.cy + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9.5"
              fontFamily="var(--font-geist-mono, monospace)"
              fill="var(--text-secondary)"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </>
  )
}

function Typewriter({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    const start = setTimeout(() => {
      let i = 0
      const tick = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(tick)
          setDone(true)
        }
      }, 38)
      return () => clearInterval(tick)
    }, startDelay)
    return () => clearTimeout(start)
  }, [text, startDelay])

  return (
    <>
      {displayed}
      {!done && (
        <span
          className="inline-block w-px h-[1em] bg-brand align-middle ml-0.5 animate-pulse"
          aria-hidden="true"
        />
      )}
    </>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function AuthLeftPanel() {
  return (
    <div className="flex flex-col justify-center h-full px-12 xl:px-16">
      <style>{`
        @keyframes auth-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-fade-up {
          opacity: 0;
          animation: auth-fade-up 0.4s ease forwards;
        }
        .auth-feature:hover .auth-feature-icon {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          background: color-mix(in srgb, var(--accent-primary) 10%, var(--bg-elevated));
        }
        .auth-feature:hover .auth-feature-label {
          color: var(--text-primary);
        }
      `}</style>

      {/* Logo */}
      <div className="auth-fade-up mb-8" style={{ animationDelay: "0s" }}>
        <span className="text-copy-primary font-semibold tracking-tight">Arch AI</span>
      </div>

      {/* Architecture diagram */}
      <div className="auth-fade-up mb-6" style={{ animationDelay: "0.05s" }}>
        <ArchDiagram />
      </div>

      {/* Headline */}
      <h1 className="text-xl font-semibold text-copy-primary mb-3 leading-snug">
        <Typewriter text="Design systems, visually." startDelay={200} />
      </h1>

      {/* Subline */}
      <p
        className="auth-fade-up text-copy-secondary text-sm mb-8 leading-relaxed"
        style={{ animationDelay: "1.4s" }}
      >
        Describe your architecture in plain English. AI maps it to a shared
        canvas. Your team refines it.
      </p>

      {/* Feature list */}
      <ul className="space-y-3">
        {FEATURES.map(({ Icon, label }, i) => (
          <li
            key={label}
            className="auth-fade-up auth-feature flex items-center gap-3 cursor-default"
            style={{ animationDelay: `${1.65 + i * 0.12}s` }}
          >
            <span
              className="auth-feature-icon flex items-center justify-center w-7 h-7 rounded-lg bg-elevated border border-surface-border text-copy-muted shrink-0"
              style={{ transition: "color 0.18s, border-color 0.18s, background 0.18s" }}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span
              className="auth-feature-label text-copy-muted text-sm"
              style={{ transition: "color 0.18s" }}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
