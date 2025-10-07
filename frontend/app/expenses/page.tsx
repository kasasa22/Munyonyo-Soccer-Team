import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ExpensesList } from "@/components/expenses-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function ExpensesPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Expenses" text="Track and manage team expenses">
        <Link href="/expenses/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </DashboardHeader>
      <ExpensesList />
    </DashboardShell>
  )
}
