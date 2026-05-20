import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex flex-1 h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-elevated border border-surface-border">
          <Lock className="h-5 w-5 text-copy-muted" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-copy-primary">Access Denied</h1>
          <p className="text-sm text-copy-muted">
            You don&apos;t have access to this project, or it no longer exists.
          </p>
        </div>
        <Button asChild variant="outline" className="border-surface-border text-copy-primary hover:bg-elevated mt-2">
          <Link href="/editor">Back to projects</Link>
        </Button>
      </div>
    </div>
  )
}
