import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">{children}</div>
}
