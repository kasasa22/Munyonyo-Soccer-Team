import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Loader2 } from "lucide-react"

export default function ReportsLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Reports" text="View detailed financial reports and analytics" />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </DashboardShell>
  )
}
