import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PaymentForm } from "@/components/payment-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPaymentPage() {
  return (
    <DashboardShell>
      <div className="flex items-center">
        <Link href="/payments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>
        </Link>
      </div>
      <DashboardHeader heading="Record Payment" text="Record a new payment from a player" />
      <PaymentForm />
    </DashboardShell>
  )
}
