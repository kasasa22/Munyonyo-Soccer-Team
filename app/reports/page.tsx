import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PaymentReports } from "@/components/payment-reports"

export default function ReportsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Reports" text="Comprehensive payment and financial reports" />
      <PaymentReports />
    </DashboardShell>
  )
}
