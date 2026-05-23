"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, UserButton } from "@clerk/nextjs"
import { LayoutDashboard, FolderClosed, Users } from "lucide-react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderClosed },
  { href: "/shared", label: "Shared", icon: Users },
] as const

export function DashboardSidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-[#2E2E36] bg-[#0F0F12]">
      <div className="px-4 pt-5 pb-4 border-b border-[#2E2E36]">
        <SidebarName />
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <SidebarNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-[#2E2E36]">
        <AccountRow />
      </div>
    </aside>
  )
}

function SidebarNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: typeof LayoutDashboard
}) {
  const pathname = usePathname() ?? ""
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-out",
        "border border-transparent",
        isActive
          ? "bg-[#8B5CF6]/30 text-white hover:bg-[#8B5CF6]/40"
          : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#23232A]",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function SidebarName() {
  const { user } = useUser()
  const fallback = user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Name"

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(fallback)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(fallback)
  }, [fallback, editing])

  const beginEditing = useCallback(() => {
    setEditing(true)
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      el.focus()
      el.select()
    })
  }, [])

  const commit = useCallback(async () => {
    const trimmed = draft.trim()
    setEditing(false)
    if (!trimmed || trimmed === fallback || !user) {
      setDraft(fallback)
      return
    }
    const parts = trimmed.split(/\s+/)
    const firstName = parts[0] ?? trimmed
    const lastName = parts.slice(1).join(" ")
    try {
      await user.update({ firstName, lastName })
    } catch (err) {
      console.error("Sidebar name update failed", err)
      setDraft(fallback)
    }
  }, [draft, fallback, user])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            void commit()
          } else if (e.key === "Escape") {
            e.preventDefault()
            setDraft(fallback)
            setEditing(false)
          }
        }}
        aria-label="Display name"
        className="w-full bg-transparent border-none outline-none underline text-sm font-semibold text-[#F3F4F6]"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={beginEditing}
      title="Click to rename"
      className="w-full text-left text-sm font-semibold text-[#F3F4F6] truncate hover:text-[#8B5CF6] transition-colors duration-150 ease-out"
    >
      {fallback}
    </button>
  )
}

function AccountRow() {
  const { user } = useUser()
  const name =
    user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account"

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <UserButton />
      <div className="flex flex-col min-w-0">
        <span className="text-sm text-[#F3F4F6] truncate">{name}</span>
        <span className="text-[11px] text-[#9CA3AF] truncate">
          {user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
        </span>
      </div>
    </div>
  )
}
