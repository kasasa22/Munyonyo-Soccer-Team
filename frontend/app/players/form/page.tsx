"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import Link from "next/link"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface PlayerData {
  name: string
  phone: string
  annual: number
  monthly: number
  pitch: number
}

export function AddPlayerForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    annualPayment: "150000",
    monthlyPayment: "10000",
    pitchPayment: "5000",
  })

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Helper function to get session headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    if (typeof window !== "undefined") {
      const sessionId = localStorage.getItem("session_id")
      if (sessionId) {
        headers["Authorization"] = `Session ${sessionId}`
      }
    }
    
    return headers
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Player name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error", 
        description: "Phone number is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Prepare data for API
      const playerData: PlayerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        annual: parseFloat(formData.annualPayment) || 150000,
        monthly: parseFloat(formData.monthlyPayment) || 10000,
        pitch: parseFloat(formData.pitchPayment) || 5000,
      }

      console.log("🏃 Creating player:", playerData)

      // Make API call to create player
      const response = await fetch(`${API_BASE_URL}/api/players`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(playerData),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }))
        throw new Error(errorData.detail || `Failed to create player: ${response.status}`)
      }

      const createdPlayer = await response.json()
      console.log("✅ Player created:", createdPlayer)

      toast({
        title: "Player added successfully",
        description: `${formData.name} has been added to the team.`,
      })

      // Redirect to players list
      router.push("/players")

    } catch (error) {
      console.error("❌ Error creating player:", error)
      
      let errorMessage = "Failed to add player"
      
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error adding player",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
      <DashboardHeader heading="Add New Player" text="Add a new player to the team and set their default payment rates" />
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Player Information</CardTitle>
          <CardDescription>Enter the player details and configure their payment rates</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* Player Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter player's full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+256 700 123 456"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Payment Rates */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Default Payment Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="annualPayment">Annual Payment (UGX)</Label>
                  <Input
                    id="annualPayment"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="150000"
                    value={formData.annualPayment}
                    onChange={(e) => handleChange("annualPayment", e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Default: UGX 150,000</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyPayment">Monthly Payment (UGX)</Label>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="10000"
                    value={formData.monthlyPayment}
                    onChange={(e) => handleChange("monthlyPayment", e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Default: UGX 10,000</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pitchPayment">Pitch Payment (UGX)</Label>
                  <Input
                    id="pitchPayment"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="5000"
                    value={formData.pitchPayment}
                    onChange={(e) => handleChange("pitchPayment", e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Default: UGX 5,000</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> These are default payment amounts. Individual payments can be customized when recording transactions.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Adding Player..." : "Add Player"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/players")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

export default AddPlayerForm