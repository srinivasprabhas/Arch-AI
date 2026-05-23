# Arch-AI

A real-time collaborative **system-design canvas** for developers and designers who think in boxes and arrows.

Drop primitives onto a shared whiteboard, connect them with edges, name things, share the link, debate the architecture. Everyone you invite sees the same canvas in real time — cursors, edits, selections, the whole thing.

It's "whiteboard with your team" without the whiteboard — built for engineers and designers who plan microservices, event-driven systems, CI/CD pipelines, data flows, and the messy middle of *let's think this through before we ship it*.

## ✨ What it is

| | |
|---|---|
| **Purpose** | A canvas-first tool for designing software systems collaboratively |
| **Audience** | Backend engineers, infra engineers, full-stack devs, system designers, product designers planning flows |
| **Mental model** | Excalidraw-style floating toolbar + Figma-style multiplayer + a small AI assist layer |
| **Built on** | Next.js 16, React 19, Liveblocks, Clerk, Prisma + Postgres, Vercel Blob, Trigger.dev, Tailwind, shadcn/ui |

## 🔋 What's built

### Canvas
- Six primitive shapes — **rectangle** (component), **pill** (service), **cylinder** (database), **hexagon** (external system), **diamond** (decision/gate), **circle** (event) — draggable from a floating shapes popover.
- Inline editable node labels (double-click), inline editable edge labels (double-click), eight color swatches via a hover toolbar, resize handles, smooth-step edge routing with arrowheads.
- Four-tool selector at the bottom: **Select** (box-drag selection) · **Hand** (panning) · **Shapes** (popover) · **Eraser** (click-to-delete).
- Mini-map with hide/show toggle, pan-zoom controls, undo / redo, fit-to-view, keyboard shortcuts.
- Per-tool cursor (default / grab / crosshair).

### Real-time multiplayer
- Shared `nodes` / `edges` storage backed by **Liveblocks** — every mutation broadcasts to all connected clients.
- Live cursors with colored name pills, presence avatar group in the floating navbar (click an avatar → small popover with name + status).
- Collaborative chat feed inside the AI sidebar — short-form messages broadcast over Liveblocks events.

### Dashboard & projects
- Sign in with **Clerk** → land on `/dashboard`.
- Canvas-card grid showing live SVG previews of every project; hover menu per card for **Rename Project**, **Copy Room ID**, **Export Image**, **Share**, **Delete**.
- Side nav: `/dashboard` · `/projects` (yours) · `/shared` (anything someone shared with you, including public view-only joins).
- Starter templates strip — one-click clone of *Microservices Architecture*, *CI/CD Pipeline*, *Event-Driven System* (deep-cloned with fresh ids so your edits stay on your copy).
- Floating account row at the bottom of the sidebar.

### Persistence
- Canvas autosaves to **Vercel Blob** (debounced ~1s after the last edit). Reload restores the canvas exactly.
- Project metadata (name, owner, collaborators, role, public-view flag) lives in **PostgreSQL** via **Prisma**.
- Per-project blob path is deterministic (`canvas/{projectId}.json`) — the URL doesn't churn between saves.

### Sharing & access control
- **Email invite** → collaborator joins as an `EDITOR` (can edit the canvas, sees the project under `/shared`).
- **Public view-only link** (toggle in the share dialog). Anyone signed in who opens the URL is auto-added as a `VIEWER`. Server-side:
  - Liveblocks auth issues a **read-only** token (`session.READ_ACCESS`) so viewers can observe presence + storage but cannot mutate.
  - The editor hides the tool bar, AI sidebar, share dialog, and inline title edit; a "View only" banner pins to the top.
- Public sharing is a one-toggle UX — the toggle off / on cleanly maps to the `Project.publicViewEnabled` boolean.

### Editor UI
- Canvas-first **floating toolbar** (Excalidraw-style) — no edge-to-edge nav bar. Floating pills for sidebar toggle, project menu, inline project title, save-status icon, collaborator avatars, templates, share, AI.
- Electric Purple (`#8B5CF6`) accents, subtle backdrop blur on every floating surface, 150ms ease-out transitions, no neon, no heavy shadows.
- Export Image — renders the canvas to a 1280×720 PNG via SVG serialization → `<canvas>.toDataURL` (Copy to clipboard or Download as `.png`).

## ⚠️ What's NOT polished — the AI parts

**Be honest: the AI integration is rough.** It's wired end-to-end so you can see the shape of where it's going, but it is not the headline feature today:

- **AI architect sidebar** — accepts a prompt, dispatches a [Trigger.dev](https://trigger.dev) background task, calls Gemini 2.5 Flash, and writes nodes/edges back to the canvas via the Liveblocks Node SDK. The prompts are basic, the layout heuristic is naive (not graph-aware), the agent doesn't ask clarifying questions or critique an existing diagram.
- **Spec generation** — turns the current graph into a Markdown technical spec and stores it as a downloadable artifact. The output is templated, not deeply reasoned, and won't replace a real design doc.
- There's **no AI-driven canvas analysis** (no "what's wrong with this architecture", no suggestions, no validation against patterns), no AI-driven layout fixing, no chat history persistence, no model selector.

**Treat the AI features as a demo layer** on top of a solid collaborative canvas — not as a polished autonomous designer. The canvas, multiplayer, persistence, sharing, dashboard, and role-based access are the parts you can rely on right now.

## ⚙️ Tech Stack

- **[Next.js 16](https://nextjs.org/)** — App Router, server-rendered pages, Turbopack dev.
- **[React 19](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)** strict mode.
- **[React Flow](https://reactflow.dev/)** (`@xyflow/react`) — the canvas renderer.
- **[Liveblocks](https://liveblocks.io/)** — multiplayer storage, presence, broadcast events; `@liveblocks/react-flow` integration syncs React Flow state to a Liveblocks room.
- **[Clerk](https://clerk.com/)** — auth + user management.
- **[Prisma 7](https://www.prisma.io/)** + **[PostgreSQL](https://www.postgresql.org/)** — typed ORM + persistent metadata store.
- **[Vercel Blob](https://vercel.com/storage/blob)** — canvas snapshots + generated spec artifacts.
- **[Trigger.dev](https://trigger.dev/)** — background tasks for AI (design agent + spec generation).
- **[Google AI SDK](https://ai.google.dev/)** (`@ai-sdk/google`) — Gemini 2.5 Flash for both AI tasks.
- **[Tailwind CSS](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)** — utility CSS + accessible primitives (Dialog, Popover, Switch, Avatar, ScrollArea, Tabs, DropdownMenu, etc.).

## 🤸 Quick Start

**Prerequisites:** [Git](https://git-scm.com/), [Node.js](https://nodejs.org/) ≥ 20, [npm](https://www.npmjs.com/).

```bash
git clone https://github.com/srinivasprabhas/Arch-AI.git
cd Arch-AI
npm install
```

**Environment variables** — create `.env.local` in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Liveblocks
LIVEBLOCKS_SECRET_KEY=

# Trigger.dev (only needed if you want the AI tasks to run)
TRIGGER_SECRET_KEY=
NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY=

# Database (Postgres — Prisma Postgres / Neon / Supabase / self-hosted)
DATABASE_URL=

# Vercel Blob (private store; PUT/GET use the read-write token)
BLOB_READ_WRITE_TOKEN=

# Google AI (only needed if you want the AI tasks to run)
GOOGLE_AI_API_KEY=

APP_URL=http://localhost:3000
```

Sign up for credentials at [Clerk](https://clerk.com/), [Liveblocks](https://liveblocks.io/), [Trigger.dev](https://trigger.dev/), [Vercel Blob](https://vercel.com/storage/blob), and [Google AI Studio](https://aistudio.google.com/).

**Database setup:**

```bash
npx prisma migrate deploy
npx prisma generate
```

**Run it:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in. You land on `/dashboard`.

**(Optional) Run the Trigger.dev worker for AI tasks** — in a separate terminal:

```bash
npm run trigger:dev
```

> ⚠️ If you skip the Trigger.dev worker + `GOOGLE_AI_API_KEY`, the canvas, multiplayer, persistence, sharing, and dashboard all still work — only the AI sidebar buttons will error.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server (Turbopack) |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run trigger:dev` | Run Trigger.dev local worker (AI tasks) |
| `npm run trigger:deploy` | Deploy Trigger.dev tasks |

## 📁 Project Structure

```
.
├── app/
│   ├── (auth)/             # Clerk sign-in / sign-up
│   ├── (dashboard)/        # /dashboard, /projects, /shared
│   ├── (editor)/editor/    # /editor/[projectId] — the canvas
│   ├── api/                # Project, canvas, collaborators, share, AI, Liveblocks auth routes
│   └── generated/prisma/   # Generated Prisma client
├── components/
│   ├── dashboard/          # Sidebar, project cards, template cards
│   ├── editor/             # Canvas, navbar, tool bar, share dialog, AI sidebar
│   └── ui/                 # shadcn primitives
├── context/                # Feature specs + progress tracker (working notes)
├── hooks/                  # use-workspace, use-canvas-autosave, use-keyboard-shortcuts, etc.
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── project-access.ts   # owner / editor / viewer role resolution
│   ├── projects.ts         # Project queries (owned / shared)
│   ├── templates/          # Starter template registry
│   └── liveblocks.ts       # Liveblocks server client + cursor color
├── prisma/
│   ├── models/             # Multi-file Prisma schema
│   └── migrations/         # SQL migrations
├── src/trigger/            # Trigger.dev background tasks (design agent, spec generation)
└── types/                  # Shared types (CanvasNode, CanvasEdge, StarterTemplate, tasks)
```

## 🗺️ Roadmap (what's worth fixing next)

- **AI quality** — better prompts, graph-aware layout, clarifying-question agent, diagram critique, persistence of chat history. Today's AI features are stubs, not the product.
- **Per-collaborator role downgrade in the invite UI** — currently every email invite is `EDITOR`; viewer-only invites only happen via the public link.
- **A "Shared" card chip** showing whether you're an editor or viewer at a glance.
- **Server-side enforcement of `?view=read-only`** at the URL layer (today the canvas already enforces via Liveblocks `READ_ACCESS`; the URL param is decorative).

## License

MIT
