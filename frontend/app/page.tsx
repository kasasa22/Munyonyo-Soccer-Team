import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PaymentSummary } from "@/components/payment-summary"
import { RecentPayments } from "@/components/recent-payments"
import { UpcomingPayments } from "@/components/upcoming-payments"
import { ExpenseSummary } from "@/components/expense-summary"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of team finances and activities" />
      
      {/* Payment Summary Cards - No grid wrapper needed */}
      <PaymentSummary />
      
      {/* Recent Payments and Upcoming Payments */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7 mt-4">
        <div className="lg:col-span-4">
          <RecentPayments />
        </div>
        <div className="lg:col-span-3">
          <UpcomingPayments />
        </div>
      </div>
      
      {/* Recent Expenses */}
      <div className="mt-4">
        <ExpenseSummary />
      </div>
    </DashboardShell>
  )
}