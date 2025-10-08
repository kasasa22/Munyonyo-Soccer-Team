import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PlayersList } from "@/components/players-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function PlayersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Players" text="Manage team players and their information">
        <Link href="/players/form">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </Link>
      </DashboardHeader>
      <PlayersList />
    </DashboardShell>
  )
}
