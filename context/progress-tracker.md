# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Completed Feature 03

## Current Goal

- Feature 04 (not started)

## Completed

- **Feature 05: Prisma Data Models & Client**
  - Created `prisma/models/project.prisma` — `Project` (ownerId, name, description?, status enum DRAFT/ARCHIVED, canvasJsonPath?, timestamps, indexes on ownerId + createdAt) and `ProjectCollaborator` (projectId cascade, email, createdAt, unique on project/email, indexes on email + project/date)
  - Created `lib/prisma.ts` — cached singleton; branches on `DATABASE_URL` prefix: `prisma+postgres://` → `withAccelerate()` extension, otherwise `PrismaPg` adapter; cached on `globalThis` in development
  - Installed `@prisma/extension-accelerate`
  - Ran `prisma migrate dev --name init-projects`; migration applied and client generated to `app/generated/prisma`
  - `npm run build` passes, 0 TypeScript errors

- **Feature 04: Project Dialogs & Editor Home**
  - Created `hooks/use-project-dialogs.ts` — dedicated hook + React context (`ProjectDialogsContext`) managing dialog state, form state, loading state, and mock project data; exports `useProjectDialogs` and `useProjectDialogsContext`
  - Created `components/editor/project-dialogs.tsx` — three dialogs (Create with live slug preview, Rename with auto-focus + enter-to-submit, Delete with destructive confirm) using `EditorDialog`
  - Updated `components/editor/editor-shell.tsx` — wraps tree with `ProjectDialogsContext.Provider`, renders `<ProjectDialogs />` outside main layout, adds mobile backdrop scrim (z-10, `bg-black/50`, `md:hidden`) that closes sidebar on tap
  - Updated `components/editor/project-sidebar.tsx` — renders project list items (owned + shared tabs), hover-revealed Rename/Delete icon buttons (owned only, hidden on shared), New Project button wired to `openCreate`
  - Updated `app/(editor)/editor/page.tsx` — client component with heading, description, New Project button wired to `openCreate` via context
  - `npx tsc --noEmit`: 0 errors; ESLint: 0 errors

- **Feature 03: Auth (Clerk)**
  - Installed `@clerk/ui` and `@clerk/themes`
  - Created `proxy.ts` at project root — Next.js 16 proxy (formerly middleware), Clerk `clerkMiddleware` with `createRouteMatcher` using NEXT_PUBLIC_CLERK_SIGN_IN/SIGN_UP_URL env vars; protects everything by default
  - Updated `app/layout.tsx` — ClerkProvider wraps root layout with `@clerk/ui/themes` dark theme; appearance variables use CSS custom properties (no hardcoded colors)
  - Updated `app/page.tsx` — server component redirects: authenticated → /editor, unauthenticated → /sign-in
  - Created `app/(auth)/layout.tsx` — public layout group (no EditorShell)
  - Created `app/(auth)/sign-in/[[...sign-in]]/page.tsx` — two-panel layout: left (logo + tagline + feature list, `hidden lg:flex`), right (centered `<SignIn />`); no gradients, no hero sections
  - Created `app/(auth)/sign-up/[[...sign-up]]/page.tsx` — same two-panel layout with `<SignUp />`
  - Created `app/(editor)/layout.tsx` — protected group, wraps with EditorShell (proxy handles auth redirect)
  - Created `app/(editor)/editor/page.tsx` — placeholder editor content
  - Updated `components/editor/editor-navbar.tsx` — added `<UserButton />` to navbar right section
  - `npm run build` passes, 0 TypeScript errors

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

- (tbd)

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

## Architecture Decisions (continued)

- Next.js 16 renames `middleware.ts` → `proxy.ts` at project root. Must export a default or `proxy` function. All Clerk middleware logic lives there.
- Clerk appearance API (v7 + @clerk/ui) uses `theme` (not `baseTheme`) and `colorForeground` / `colorInput` / `colorInputForeground` — not the deprecated `colorText`/`colorInputBackground` names.

## Session Notes

- Project uses Next.js 16.2.4, React 19.2.4, Tailwind v4, TypeScript strict mode.
- tsconfig paths: @/* → ./* (root-relative imports).
- Do NOT modify files in components/ui/ — they are shadcn-generated.
- Use cn() from @/lib/utils for all className merging.
- Use project token utilities (bg-base, bg-surface, text-copy-primary, etc.)
  not raw hex or zinc-* Tailwind classes.
