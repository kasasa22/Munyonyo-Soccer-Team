"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"

interface PlayerDetailsProps {
  id: string
}

export function PlayerDetails({ id }: PlayerDetailsProps) {
  // In a real app, you would fetch this data from an API
  const player = {
    id,
    name: "Mukalazi Ismail",
    phone: "+256 700 123 456",
    annualPayment: 150000,
    monthlyPayment: 10000,
    pitchPayment: 5000,
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Player Details</CardTitle>
            <CardDescription>Player information and payment rates</CardDescription>
          </div>
          <Link href={`/players/${id}/edit`}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
              <p className="text-lg font-medium">{player.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
              <p className="text-lg">{player.phone}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Payment Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Annual Payment</p>
                <p className="text-xl font-semibold text-green-600">UGX {player.annualPayment.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Monthly Payment</p>
                <p className="text-xl font-semibold text-blue-600">UGX {player.monthlyPayment.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Pitch Payment</p>
                <p className="text-xl font-semibold text-orange-600">UGX {player.pitchPayment.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button>Record New Payment</Button>
            <Link href="/players">
              <Button variant="outline">Back to Players</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlayerDetails