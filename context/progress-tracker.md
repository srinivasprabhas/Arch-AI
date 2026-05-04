# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Completed Feature 02

## Current Goal

- Feature 02: Editor Chrome (navbar + sidebar shell)

## Completed

- **Feature 02: Editor Chrome**
  - Created `components/editor/editor-navbar.tsx` — fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose, left/center/right sections, bg-surface + border-surface-border
  - Created `components/editor/project-sidebar.tsx` — absolute-positioned slide-in panel, translateX animation, Projects header + close button, My Projects/Shared tabs with empty states, full-width New Project button
  - Created `components/editor/editor-dialog.tsx` — reusable dialog wrapper (title, description, footer, children) using project tokens (bg-elevated, rounded-3xl, border-surface-border)
  - TypeScript strict-mode: 0 errors

- **Feature 01: Design System**
  - Installed and configured shadcn/ui (Tailwind v4, components.json, default style)
  - Added Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea to components/ui/
  - Installed lucide-react, class-variance-authority, tailwindcss-animate,
    clsx, tailwind-merge, and all @radix-ui/* peer dependencies
  - Created lib/utils.ts with cn() helper (clsx + tailwind-merge)
  - Configured globals.css: full dark theme CSS variables, @theme inline mappings
    for both shadcn semantic tokens and project-specific tokens, base layer resets
  - TypeScript strict-mode type check: 0 errors

## In Progress

- None.

## Next Up

- Feature 02 (TBD — see feature-specs/)

## Open Questions

- None currently.

## Architecture Decisions

- shadcn/ui chosen as component library (see ui-context.md) — no custom design
  system, components live in components/ui/.
- Tailwind v4 CSS-variable-first approach: all theme tokens defined as CSS custom
  properties in globals.css and exposed to Tailwind via @theme inline.
- Dark-only theme: no light mode variant, all CSS variables set on :root with
  dark values directly (no .dark class toggling needed).
- tailwindcss-animate added as @plugin in globals.css to support dialog
  animate-in/animate-out utilities.
- @theme inline maps both shadcn semantic names (--background, --primary, etc.)
  and project-specific names (--color-brand, --color-copy-primary, etc.) so both
  sets of utility classes are available.

## Session Notes

- Project uses Next.js 16.2.4, React 19.2.4, Tailwind v4, TypeScript strict mode.
- tsconfig paths: @/* → ./* (root-relative imports).
- Do NOT modify files in components/ui/ — they are shadcn-generated.
- Use cn() from @/lib/utils for all className merging.
- Use project token utilities (bg-base, bg-surface, text-copy-primary, etc.)
  not raw hex or zinc-* Tailwind classes.
