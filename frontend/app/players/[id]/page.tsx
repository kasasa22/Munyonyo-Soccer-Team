import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PlayerDetails } from "@/components/player-details"
import { PlayerPaymentHistory } from "@/components/player-payment-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PlayerPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <div className="flex items-center">
        <Link href="/players">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Players
          </Button>
        </Link>
      </div>
      <DashboardHeader heading="Player Details" text="View and manage player information" />

      <Tabs defaultValue="details" className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <PlayerDetails id={params.id} />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PlayerPaymentHistory id={params.id} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
