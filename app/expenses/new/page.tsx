import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ExpenseForm } from "@/components/expense-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewExpensePage() {
  return (
    <DashboardShell>
      <div className="flex items-center">
        <Link href="/expenses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Expenses
          </Button>
        </Link>
      </div>
      <DashboardHeader heading="Record Expense" text="Record a new team expense" />
      <ExpenseForm />
    </DashboardShell>
  )
}
