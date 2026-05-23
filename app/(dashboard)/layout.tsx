import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full bg-[#0F0F12] text-[#F3F4F6]">
      <DashboardSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  )
}
