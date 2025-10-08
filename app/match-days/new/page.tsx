"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Calendar, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// API configuration
const API_BASE_URL = ""

interface MatchDay {
  id: string
  match_date: string
  opponent: string | null
  venue: string | null
  match_type: string
  created_at: string
}

export default function NewMatchDayPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [matchDays, setMatchDays] = useState<MatchDay[]>([])
  const [isLoadingMatchDays, setIsLoadingMatchDays] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    matchDate: "",
    opponent: "",
    venue: "",
    matchType: "friendly",
  })

  // Helper function to get session headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  // Load existing match days
  useEffect(() => {
    loadMatchDays()
  }, [])

  const loadMatchDays = async () => {
    try {
      setIsLoadingMatchDays(true)
      const response = await fetch(`${API_BASE_URL}/api/match-days?limit=50`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setMatchDays(data)
      }
    } catch (error) {
      console.error("Error loading match days:", error)
    } finally {
      setIsLoadingMatchDays(false)
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.matchDate) {
      toast({
        title: "Validation Error",
        description: "Match date is required",
        variant: "destructive",
      })
      return false
    }

    // Check if date is in the future or today
    const selectedDate = new Date(formData.matchDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      toast({
        title: "Validation Error",
        description: "Match date cannot be in the past",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const matchDayData = {
        match_date: formData.matchDate,
        opponent: formData.opponent.trim() || null,
        venue: formData.venue.trim() || null,
        match_type: formData.matchType,
      }

      console.log("🏟️ Creating match day:", matchDayData)

      const response = await fetch(`${API_BASE_URL}/api/match-days`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(matchDayData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }))
        throw new Error(errorData.detail || "Failed to create match day")
      }

      const createdMatchDay = await response.json()
      console.log("✅ Match day created:", createdMatchDay)

      toast({
        title: "Match day created",
        description: `Match day for ${new Date(formData.matchDate).toLocaleDateString()} has been created successfully.`,
      })

      // Reset form
      setFormData({
        matchDate: "",
        opponent: "",
        venue: "",
        matchType: "friendly",
      })

      // Reload match days
      await loadMatchDays()

      // Navigate back to expenses after a short delay
      setTimeout(() => {
        router.push("/expenses")
      }, 1500)

    } catch (error) {
      console.error("❌ Error creating match day:", error)
      
      let errorMessage = "Failed to create match day"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error creating match day",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
      <DashboardHeader heading="Create Match Day" text="Schedule a new match day to organize expenses and payments" />
      
      <div className="space-y-6">
        {/* Recent Match Days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Match Days
            </CardTitle>
            <CardDescription>
              {isLoadingMatchDays ? "Loading..." : `${matchDays.length} match days scheduled`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMatchDays ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : matchDays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchDays.slice(0, 6).map((matchDay) => (
                  <div key={matchDay.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="font-medium text-blue-600">
                      {formatDate(matchDay.match_date)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {matchDay.opponent ? `vs ${matchDay.opponent}` : "No opponent set"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {matchDay.venue || "Venue TBD"} • {matchDay.match_type}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No match days scheduled yet. Create your first match day below.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Create New Match Day Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Schedule New Match Day
            </CardTitle>
            <CardDescription>
              Create a new match day to organize expenses and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="matchDate">Match Date *</Label>
                  <Input
                    id="matchDate"
                    type="date"
                    value={formData.matchDate}
                    onChange={(e) => handleChange("matchDate", e.target.value)}
                    required
                    disabled={isLoading}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchType">Match Type</Label>
                  <Select
                    value={formData.matchType}
                    onValueChange={(value) => handleChange("matchType", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="league">League</SelectItem>
                      <SelectItem value="cup">Cup</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opponent">Opponent</Label>
                  <Input
                    id="opponent"
                    placeholder="e.g., Arsenal FC (optional)"
                    value={formData.opponent}
                    onChange={(e) => handleChange("opponent", e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    placeholder="e.g., Home Stadium (optional)"
                    value={formData.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Creating..." : "Create Match Day"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/expenses")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}