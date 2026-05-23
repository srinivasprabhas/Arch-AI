# UI Context

## Theme

Dark only. No light mode. The visual language is a dark technical workspace — near-black backgrounds, layered surfaces, and vivid accent colors for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

| Role             | CSS Variable           | Hex / Value               |
| ---------------- | ---------------------- | ------------------------- |
| Page background  | `--bg-base`            | `#080809`                 |
| Surface          | `--bg-surface`         | `#111114`                 |
| Elevated surface | `--bg-elevated`        | `#18181c`                 |
| Subtle surface   | `--bg-subtle`          | `#1e1e23`                 |
| Default border   | `--border-default`     | `#2a2a30`                 |
| Subtle border    | `--border-subtle`      | `#3a3a42`                 |
| Primary text     | `--text-primary`       | `#f0f0f4`                 |
| Secondary text   | `--text-secondary`     | `#c0c0cc`                 |
| Muted text       | `--text-muted`         | `#808090`                 |
| Faint text       | `--text-faint`         | `#505060`                 |
| Brand accent     | `--accent-primary`     | `#00c8d4` (cyan)          |
| Brand dim        | `--accent-primary-dim` | `rgba(0, 200, 212, 0.12)` |
| AI accent        | `--accent-ai`          | `#6457f9` (indigo-purple) |
| AI text          | `--accent-ai-text`     | `#8b82ff`                 |
| Error            | `--state-error`        | `#ff4d4f`                 |
| Success          | `--state-success`      | `#34d399`                 |
| Warning          | `--state-warning`      | `#fbbf24`                 |

Tailwind utility names map to these variables. Use `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.

## Typography

| Role      | Font       | CSS Variable        |
| --------- | ---------- | ------------------- |
| UI text   | Geist Sans | `--font-geist-sans` |
| Code/mono | Geist Mono | `--font-geist-mono` |

Both fonts are loaded via `next/font/google` and applied as CSS variables on the `<html>` element. The base `body` uses Geist Sans with `antialiased`.

## Border Radius

Radius increases with surface depth — smaller for inner elements, larger for outer containers.

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-xl`  |
| Cards / panels    | `rounded-2xl` |
| Modal / overlay   | `rounded-3xl` |

## Canvas

### Node Color Palette

8 defined color pairs. Each pair specifies a dark node fill and a vivid contrasting text color tuned for readability on the dark canvas. Defined in `types/canvas.ts` as `NODE_COLORS`.

| Node fill | Text color | Character              |
| --------- | ---------- | ---------------------- |
| `#1F1F1F` | `#EDEDED`  | Neutral dark (default) |
| `#10233D` | `#52A8FF`  | Blue                   |
| `#2E1938` | `#BF7AF0`  | Purple                 |
| `#331B00` | `#FF990A`  | Orange                 |
| `#3C1618` | `#FF6166`  | Red                    |
| `#3A1726` | `#F75F8F`  | Pink                   |
| `#0F2E18` | `#62C073`  | Green                  |
| `#062822` | `#0AC7B4`  | Teal                   |

Default node color: `#1F1F1F` with `#EDEDED` text.

### Edge Style

Smooth-step path with an arrow marker. Default edge color: `#f8fafc`. Stroke width is thin — edges are visually secondary to nodes.

### Node Shapes

6 supported shapes, defined in `types/canvas.ts` as `NODE_SHAPES`. Complex shapes (diamond, hexagon, cylinder) are rendered as inline SVGs rather than CSS borders.

- `rectangle` — default general-purpose node
- `diamond` — decision / gateway
- `circle` — event / endpoint
- `pill` — service / process
- `cylinder` — database / storage
- `hexagon` — external system / boundary

### Connection Handles

Small white circular handles, hidden by default, revealed on node hover. Appear at all four sides of a node.

### Canvas Background

React Flow `<Background>` component. Canvas sits on the base background color.

## Component Library

shadcn/ui on top of Tailwind. No custom design system. Components live in `components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## Layout Patterns

- Editor workspace: canvas-first, full-bleed canvas. No fixed top navbar — all chrome is layered as **floating overlays** above the canvas. Project sidebar is a floating slide-in panel on the left; AI sidebar slides in from the right; the editor toolbar floats at the top.
- Sidebars: floating overlay with dark semi-transparent background, subtle border, and `backdrop-blur`. Never shift canvas layout.
- Modals and dialogs: centered overlay, `rounded-3xl`, dark background with backdrop blur.

## Floating Editor Toolbar

The editor toolbar is **not** a full-width bar. It floats at `top-4` over the canvas, broken into multiple grouped pills with gaps between them. Layout: `[left controls] [right controls]` justified to the edges, never edge-to-edge.

### Floating Surface Design Tokens

These tokens are used **exclusively** for the floating toolbar groups, dropdown menus, and any active floating accent. They are scoped to the floating-chrome layer and do not replace the canvas/UI tokens above.

| Purpose          | Color           | Hex                         |
| ---------------- | --------------- | --------------------------- |
| Primary          | Electric Purple | `#8B5CF6`                   |
| Primary Hover    | Soft Purple     | `#A78BFA`                   |
| Primary Pressed  | Deep Purple     | `#7C3AED`                   |
| Background       | Rich Dark       | `#0F0F12`                   |
| Surface          | Card Dark       | `#18181C`                   |
| Elevated Surface | Layer Dark      | `#23232A`                   |
| Border           | Subtle Border   | `#2E2E36`                   |
| Text Primary     | Soft White      | `#F3F4F6`                   |
| Text Secondary   | Gray            | `#9CA3AF`                   |
| Success          | Emerald         | `#10B981`                   |
| Error            | Rose Red        | `#EF4444`                   |
| Active Glow      | Purple Glow     | `0 0 24px rgba(139,92,246,0.35)` |

Avoid: giant blurs, neon, layered shadows. The glow is subtle and only appears on **active** floating elements (e.g. the AI sidebar toggle while open).

### Group Vocabulary

- Floating group container: `rounded-xl border border-[#2E2E36] bg-[#18181C]/85 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)]`
- Dropdown menus: `rounded-2xl border border-[#2E2E36] bg-[#18181C]/95 backdrop-blur-md`
- Icon button (inside group): `h-8 w-8 rounded-xl text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#23232A]`
- Transitions: `transition-colors duration-150 ease-out`. No large scale animations — only opacity + translate.

### Toolbar Sections

**Left:**
1. Sidebar toggle — Lucide `PanelRightClose` / `PanelRightOpen`.
2. Editor menu — Lucide `Menu` opens a shadcn `DropdownMenu` with items:
   - Rename Scene (`Pencil`) — focuses the inline project title for editing.
   - Copy Room ID (`Copy`) — writes `project.id` to the clipboard.
   - Export Image (`ImageDown`) — placeholder (not yet wired to canvas export).
   - Share (`Share2`) — opens the existing share dialog.
3. Project title — inline-editable text. Default: `text-[#F3F4F6]`. Hover: transitions to `#8B5CF6` with a faded underline. Active editing: input is `border-none outline-none bg-transparent underline`, full text selected on click, commits on Enter or blur via `PATCH /api/projects/:id`, reverts on Escape.
4. Save status — icon-only indicator (no text). `Saved` → muted `Check`, `Saving` → muted `Loader2` spinner (tooltip "Saving"), error → `AlertTriangle` in `#EF4444` (tooltip "Sync failed").

**Right:** `avatars → templates → share → AI → profile`, with tight spacing.

### Avatar Group

Collaborator avatars live inside the floating toolbar (not on the canvas itself). Built on the shadcn `Avatar` primitives with project-local `AvatarGroup` / `AvatarGroupCount` wrappers (`components/ui/avatar.tsx`).

Rules:
- Inactive avatars rendered with `grayscale`; restored to color on group hover.
- Overlapping with `-space-x-2` and a `ring-2 ring-[#18181C]` outline so they read on the dark surface.
- Up to 4 avatars visible; the remainder collapses into a circular `AvatarGroupCount` chip on the elevated surface (e.g. `+3`).
- The current user is **not** rendered in this group — their identity is the Clerk `<UserButton />` on the far right of the toolbar.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.