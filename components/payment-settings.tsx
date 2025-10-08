"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const availablePlayers = [
  "Marcus Johnson",
  "Sarah Williams", 
  "David Chen",
  "Emma Rodriguez",
  "James Wilson",
  "Lisa Anderson",
  "Michael Brown",
  "Anna Taylor"
]

export function PaymentSettings() {
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [annualSubscription, setAnnualSubscription] = useState("")
  const [monthlySubscription, setMonthlySubscription] = useState("")
  const [pitchPayment, setPitchPayment] = useState("")

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="playerSelect">Player Name</Label>
        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
          <SelectTrigger>
            <SelectValue placeholder="Select a player" />
          </SelectTrigger>
          <SelectContent>
            {availablePlayers.map((player) => (
              <SelectItem key={player} value={player}>
                {player}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="annualSubscription">Annual Subscription (UGX)</Label>
        <Input
          id="annualSubscription"
          value={annualSubscription}
          onChange={(e) => setAnnualSubscription(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="monthlySubscription">Monthly Subscription (UGX)</Label>
        <Input
          id="monthlySubscription"
          value={monthlySubscription}
          onChange={(e) => setMonthlySubscription(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="pitchPayment">Pitch Payment (UGX)</Label>
        <Input
          id="pitchPayment"
          value={pitchPayment}
          onChange={(e) => setPitchPayment(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <Button 
        onClick={() => {
          // Handle add functionality
          console.log('Adding player payment:', {
            player: selectedPlayer,
            annual: annualSubscription,
            monthly: monthlySubscription,
            pitch: pitchPayment
          })
        }}
        disabled={!selectedPlayer || !annualSubscription || !monthlySubscription || !pitchPayment}
      >
        Add Player Payment
      </Button>
    </div>
  )
}