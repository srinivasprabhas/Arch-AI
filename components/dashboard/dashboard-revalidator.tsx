"use client"

import { startTransition, useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Mounts once at the dashboard page level. When the tab regains focus or
 * the document becomes visible (mobile foreground switch, alt-tab back),
 * we call `router.refresh()` to invalidate the route's RSC cache and
 * re-run the server-side project listing query.
 *
 * The refresh path is wrapped in three layers of defensiveness because
 * `router.refresh()` from Next.js 16 + Turbopack throws an internal
 * "Router action dispatched before initialization" error if it lands
 * while the router instance is mid-HMR or mid-transition:
 *
 *   1. Debounce (150 ms). Coalesces a focus + visibility burst into one
 *      refresh; also pushes the call past the synchronous mount tick so
 *      the router has fully initialized when we dispatch.
 *   2. `startTransition`. Marks the refresh as a non-urgent update, which
 *      lets React/Next defer it through the next commit boundary instead
 *      of fighting an in-flight transition.
 *   3. `try/catch` around the actual call. The Next 16 internal error is
 *      not actionable — swallow it and let the next focus event retry.
 *
 * The fresh `updatedAt` returned by the listing then flows down into each
 * `ProjectCard`'s fetch effect via its dep array, which re-fetches the
 * canvas blob and updates the preview. Dashboard previews stay in sync
 * with what other tabs / collaborators are saving without polling,
 * without WebSocket subscriptions, and without manual refresh.
 */
export function DashboardRevalidator() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return

    let timer: ReturnType<typeof setTimeout> | null = null

    const refresh = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        startTransition(() => {
          try {
            router.refresh()
          } catch (err) {
            console.warn("Dashboard router refresh skipped", err)
          }
        })
      }, 150)
    }

    const handleFocus = () => refresh()
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh()
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [router])

  return null
}
