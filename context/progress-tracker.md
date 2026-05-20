# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Completed Feature 09

## Current Goal

- Next feature (tbd)

## Completed

- **Feature 09: Share Dialog**
  - Created `lib/clerk-users.ts` — `enrichEmails(emails)` uses `clerkClient().users.getUserList({ emailAddress: emails })` to map emails to `{ displayName, imageUrl }`. Wrapped in try/catch — Clerk lookup failures fall back to email-only rows so the UI still renders.
  - Created `app/api/projects/[projectId]/collaborators/route.ts` — `GET` returns `{ isOwner, collaborators: [{ id, email, displayName?, imageUrl? }] }` (allowed for owner OR collaborator), enriches via Clerk; `POST` invites by email with regex validation, lowercased; 401/403/404 enforced server side, 409 on duplicate (Prisma P2002), 400 if owner tries to invite themselves
  - Created `app/api/projects/[projectId]/collaborators/[collaboratorId]/route.ts` — `DELETE` enforces owner check + collaborator-belongs-to-project check before deleting, returns 204
  - Extended `hooks/use-workspace.ts` — added `isShareDialogOpen`, `openShareDialog`, `closeShareDialog` to `WorkspaceContextValue`
  - Updated `components/editor/editor-shell.tsx` — owns share dialog open state, threads new context values into `WorkspaceContext.Provider`
  - Updated `components/editor/editor-navbar.tsx` — Share button `onClick={openShareDialog}` from `useWorkspace()`
  - Created `components/editor/share-dialog.tsx` — fetches collaborators on open; owners see invite form (email + submit) and per-row Remove buttons; collaborators see read-only list; "Copy link" button copies `${origin}/editor/${projectId}` with 2s "Copied!" feedback via Check icon; avatars use Clerk `imageUrl`, fall back to initial circle
  - Rendered `<ShareDialog />` inside `components/editor/workspace.tsx` so it sees the active project via `useWorkspace()`
  - `npm run build` passes, 0 TypeScript errors; all 10 routes in build output (two new `/api/projects/[projectId]/collaborators` routes)

- **Feature 08: Editor Workspace Shell**
  - Created `lib/project-access.ts` — `getCurrentClerkIdentity()` (returns `{userId, email}` from `auth()` + `currentUser()`) and `checkProjectAccess(projectId)` (returns `unauthenticated` | `denied` | `granted` with project info; grants access when user is owner OR has a `ProjectCollaborator` row for their primary email)
  - Created `components/editor/access-denied.tsx` — centered layout with lock icon, message, and "Back to projects" link to `/editor`
  - Created `hooks/use-workspace.ts` — `WorkspaceContext` exposing `project`, `setProject`, `isAiSidebarOpen`, `toggleAiSidebar`
  - Updated `components/editor/editor-shell.tsx` — owns workspace project state + AI sidebar open state, wraps tree with `WorkspaceContext.Provider` (nested inside existing `ProjectDialogsContext.Provider`)
  - Updated `components/editor/editor-navbar.tsx` — consumes `useWorkspace()`; when a project is active, shows the project name (truncated, left-aligned), a Share button, and an AI sidebar toggle (Sparkles icon, highlights with `bg-accent-dim` + `text-ai-text` when open); falls back to plain navbar otherwise
  - Updated `components/editor/project-sidebar.tsx` — project rows are now `next/link` to `/editor/[id]`; the row matching the current `usePathname()` segment gets `bg-elevated` + `aria-current="page"` highlight; fixed lingering `hover:text-state-error` → `hover:text-error` token name
  - Created `components/editor/workspace.tsx` — client component that on mount calls `setProject(project)` (cleanup → `null` on unmount); renders the canvas placeholder (full-bleed dark `bg-base` with centered "Canvas coming soon" copy) and a right-side slide-over `AiSidebar` placeholder (w-80, translate-x animation, header with Sparkles + close button)
  - Updated `app/(editor)/editor/[projectId]/page.tsx` — server component now calls `checkProjectAccess(projectId)` and dispatches: `unauthenticated` → `redirect("/sign-in")`, `denied` (missing OR not owner/collaborator) → `<AccessDenied />`, `granted` → `<Workspace project={result.project} />`
  - `npm run build` passes, 0 TypeScript errors; all 8 routes in build output

- **Feature 07: Wire Editor Home to Real Project API**
  - Created `lib/projects.ts` — `getOwnedProjects(userId)` and `getSharedProjects(email)` server helpers using Prisma
  - Converted `app/(editor)/layout.tsx` to an async server component; fetches owned + shared projects via `auth()` + `currentUser()` and passes them as props to `EditorShell`
  - Updated `components/editor/editor-shell.tsx` — accepts `ownedProjects`/`sharedProjects` props, threads them into `useProjectDialogs`
  - Replaced mock logic in `hooks/use-project-dialogs.ts` with real API calls: POST `/api/projects` (slug+suffix roomId aligned with project id, navigates to `/editor/[id]`), PATCH `/api/projects/[id]` + `router.refresh()`, DELETE + redirect to `/editor` if active workspace else refresh
  - Updated POST handler in `app/api/projects/route.ts` to accept optional `id` in body for slug-based room id
  - Updated `components/editor/project-dialogs.tsx` — create dialog shows room id preview
  - Updated `components/editor/project-sidebar.tsx` — uses `ownedProjects`/`sharedProjects` directly from context
  - Created `app/(editor)/editor/[projectId]/page.tsx` — workspace stub (server component, redirects to `/editor` if project not found)
  - `npm run build` passes, 0 TypeScript errors; all 8 routes in build output

- **Feature 06: Project API Routes**
  - Created `app/api/projects/route.ts` — GET (list by ownerId, ordered by createdAt desc) + POST (create with default name "Untitled Project"); both return 401 for unauthenticated requests
  - Created `app/api/projects/[projectId]/route.ts` — PATCH (rename, validates non-empty name) + DELETE (204 no content); both enforce owner check: 401 if unauthenticated, 403 if not owner, 404 if project not found
  - Added `serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"]` to `next.config.ts` to prevent Turbopack from bundling the Prisma runtime
  - Upgraded `prisma` CLI from v6.19.3 → v7.8.0 to align with `@prisma/client` v7; regenerated client; removed removed `url` from `schema.prisma` datasource block (now managed by `prisma.config.ts`); removed invalid `engine: "classic"` from `prisma.config.ts`
  - `npm run build` passes, 0 TypeScript errors; all four routes appear in build output

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
