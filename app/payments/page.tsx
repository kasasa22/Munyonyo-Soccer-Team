import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PaymentsList } from "@/components/payments-list"

export default function PaymentsPage() {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Payments" 
        text="Track and manage all team payments and financial transactions"
      />
      <PaymentsList />
    </DashboardShell>
  )
}