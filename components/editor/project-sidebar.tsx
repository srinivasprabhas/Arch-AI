"use client"

import { useState, type ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, UserButton } from "@clerk/nextjs"
import {
  ChevronDown,
  FolderClosed,
  FolderOpen,
  LayoutDashboard,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  type Project,
  useProjectDialogsContext,
} from "@/hooks/use-project-dialogs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function ProjectSidebar({ isOpen, onClose, className }: ProjectSidebarProps) {
  const { ownedProjects, sharedProjects } = useProjectDialogsContext()
  const pathname = usePathname() ?? ""

  return (
    <aside
      className={cn(
        "absolute inset-y-0 left-0 z-20 w-72 flex flex-col",
        "bg-[#0F0F12] border-r border-[#2E2E36]",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-[#2E2E36] shrink-0">
        <SidebarName />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className={cn(
            "p-1 rounded-lg text-[#9CA3AF] transition-colors duration-150 ease-out",
            "hover:text-[#F3F4F6] hover:bg-[#23232A]",
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-1">
        <SidebarNavLink
          href="/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          isActive={pathname === "/dashboard" || pathname.startsWith("/dashboard/")}
        />
        <SidebarCollapsibleNav
          href="/projects"
          label="Projects"
          icon={FolderClosed}
          isActive={pathname === "/projects" || pathname.startsWith("/projects/")}
          projects={ownedProjects}
        />
        <SidebarCollapsibleNav
          href="/shared"
          label="Shared"
          icon={Users}
          isActive={pathname === "/shared" || pathname.startsWith("/shared/")}
          projects={sharedProjects}
        />
      </nav>

      <Separator className="bg-[#2E2E36]" />

      <div className="px-3 py-3 shrink-0">
        <AccountRow />
      </div>
    </aside>
  )
}

function SidebarName() {
  const { user } = useUser()
  const fallback =
    user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    user?.username?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Name"

  return (
    <span className="text-sm font-semibold text-[#F3F4F6] truncate">
      {fallback}
    </span>
  )
}

function SidebarNavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
        "transition-colors duration-150 ease-out",
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

function SidebarCollapsibleNav({
  href,
  label,
  icon: Icon,
  isActive,
  projects,
}: {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  isActive: boolean
  projects: Project[]
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() ?? ""
  const activeId = pathname.startsWith("/editor/")
    ? pathname.slice("/editor/".length)
    : null

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center rounded-lg",
          "transition-colors duration-150 ease-out",
          isActive
            ? "bg-[#8B5CF6]/30 text-white"
            : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#23232A]",
        )}
      >
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          className="flex-1 flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg"
        >
          <Icon className="h-4 w-4" />
          <span className="font-medium">{label}</span>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen((o) => !o)
          }}
          aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
          aria-expanded={open}
          className={cn(
            "p-1.5 mr-1 rounded-md",
            "hover:bg-black/20",
            "transition-transform duration-150 ease-out",
            open && "rotate-180",
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-0.5 pl-7 pr-1 py-1">
          {projects.length === 0 ? (
            <EmptyChild label={label.toLowerCase()} />
          ) : (
            projects.map((p) => (
              <ProjectChildRow
                key={p.id}
                project={p}
                isActive={p.id === activeId}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function EmptyChild({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#505060]">
      <FolderOpen className="h-3.5 w-3.5" />
      No {label} yet
    </div>
  )
}

function ProjectChildRow({
  project,
  isActive,
}: {
  project: Project
  isActive: boolean
}) {
  const { openRename, openDelete } = useProjectDialogsContext()

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-md transition-colors",
        isActive ? "bg-[#23232A]" : "hover:bg-[#23232A]",
      )}
    >
      <Link
        href={`/editor/${project.id}`}
        className={cn(
          "flex-1 min-w-0 px-2 py-1.5 text-xs truncate",
          isActive ? "text-[#F3F4F6] font-medium" : "text-[#9CA3AF]",
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {project.name}
      </Link>
      {project.isOwned && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pr-1">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openRename(project)
            }}
            aria-label={`Rename ${project.name}`}
            className="p-1 rounded text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-black/30 transition-colors"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openDelete(project)
            }}
            aria-label={`Delete ${project.name}`}
            className="p-1 rounded text-[#9CA3AF] hover:text-[#EF4444] hover:bg-black/30 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
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
