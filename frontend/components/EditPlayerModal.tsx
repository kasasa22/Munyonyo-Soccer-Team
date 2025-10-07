"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle } from "lucide-react"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Player {
  id: string
  name: string
  phone: string
  annual: number
  monthly: number
  pitch: number
  match_day?: number
  created_at: string
  updated_at: string
}

interface EditPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  player: Player
  onPlayerUpdated: (updatedPlayer: Player) => void
}

export function EditPlayerModal({ isOpen, onClose, player, onPlayerUpdated }: EditPlayerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: player.name,
    phone: player.phone,
    annual: player.annual.toString(),
    monthly: player.monthly.toString(),
    pitch: player.pitch.toString(),
    match_day: player.match_day?.toString() || "5000",
  })

  // Helper function to get auth headers
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

  // Reset form data when modal opens with new player
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: player.name,
        phone: player.phone,
        annual: player.annual.toString(),
        monthly: player.monthly.toString(),
        pitch: player.pitch.toString(),
        match_day: player.match_day?.toString() || "5000",
      })
      setError(null)
    }
  }, [isOpen, player])

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a player name",
        variant: "destructive",
      })
      return
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    if (!formData.annual || parseFloat(formData.annual) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid annual payment amount",
        variant: "destructive",
      })
      return
    }

    if (!formData.monthly || parseFloat(formData.monthly) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid monthly payment amount",
        variant: "destructive",
      })
      return
    }

    if (!formData.pitch || parseFloat(formData.pitch) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid pitch payment amount",
        variant: "destructive",
      })
      return
    }

    if (!formData.match_day || parseFloat(formData.match_day) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid match day payment amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Prepare player update data - only include changed fields
      const updateData: any = {}
      
      // Only include fields if they changed
      if (formData.name.trim() !== player.name) {
        updateData.name = formData.name.trim()
      }
      
      if (formData.phone.trim() !== player.phone) {
        updateData.phone = formData.phone.trim()
      }
      
      const newAnnual = parseFloat(formData.annual)
      if (newAnnual !== player.annual) {
        updateData.annual = newAnnual
      }
      
      const newMonthly = parseFloat(formData.monthly)
      if (newMonthly !== player.monthly) {
        updateData.monthly = newMonthly
      }
      
      const newPitch = parseFloat(formData.pitch)
      if (newPitch !== player.pitch) {
        updateData.pitch = newPitch
      }
      
      const newMatchDay = parseFloat(formData.match_day)
      if (newMatchDay !== player.match_day) {
        updateData.match_day = newMatchDay
      }

      console.log("🏃 Updating player with data:", updateData)

      // Make API call to update player
      const response = await fetch(`${API_BASE_URL}/api/players/${player.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        let errorMessage = `Failed to update player: ${response.status}`
        
        try {
          const errorData = await response.json()
          console.log("❌ Error response data:", errorData)
          
          // Handle different error response formats
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else if (typeof errorData.detail === 'object') {
            // Handle validation errors or complex error objects
            errorMessage = JSON.stringify(errorData.detail)
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (Array.isArray(errorData)) {
            // Handle array of errors
            errorMessage = errorData.map(err => err.msg || err.message || err).join(', ')
          }
        } catch (parseError) {
          console.log("❌ Could not parse error response, using default message")
        }
        
        throw new Error(errorMessage)
      }

      const updatedPlayer = await response.json()
      console.log("✅ Player updated successfully:", updatedPlayer)

      toast({
        title: "Player updated",
        description: `${formData.name} has been updated successfully.`,
      })

      // Call the callback to update the players list
      onPlayerUpdated(updatedPlayer)
      
      // Close the modal
      onClose()

    } catch (error) {
      console.error("❌ Error updating player:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update player"
      
      toast({
        title: "Error updating player",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>
            Update player details for {player.name}
          </DialogDescription>
        </DialogHeader>

        {/* Current Player Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-3">Current Player Info</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{player.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{player.phone}</span>
            </div>
            <div>
              <span className="text-gray-600">Annual:</span>
              <span className="ml-2 font-medium text-green-600">UGX {player.annual.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Monthly:</span>
              <span className="ml-2 font-medium text-green-600">UGX {player.monthly.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Pitch:</span>
              <span className="ml-2 font-medium text-green-600">UGX {player.pitch.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Match Day:</span>
              <span className="ml-2 font-medium text-green-600">UGX {(player.match_day || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Player Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter player name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>

            {/* Annual Payment */}
            <div className="space-y-2">
              <Label htmlFor="annual">Annual Payment (UGX) *</Label>
              <Input
                id="annual"
                type="number"
                placeholder="Enter annual payment"
                value={formData.annual}
                onChange={(e) => handleChange("annual", e.target.value)}
                min="0"
                step="1000"
              />
            </div>

            {/* Monthly Payment */}
            <div className="space-y-2">
              <Label htmlFor="monthly">Monthly Payment (UGX) *</Label>
              <Input
                id="monthly"
                type="number"
                placeholder="Enter monthly payment"
                value={formData.monthly}
                onChange={(e) => handleChange("monthly", e.target.value)}
                min="0"
                step="1000"
              />
            </div>

            {/* Pitch Payment */}
            <div className="space-y-2">
              <Label htmlFor="pitch">Pitch Payment (UGX) *</Label>
              <Input
                id="pitch"
                type="number"
                placeholder="Enter pitch payment"
                value={formData.pitch}
                onChange={(e) => handleChange("pitch", e.target.value)}
                min="0"
                step="1000"
              />
            </div>

            {/* Match Day Payment */}
            <div className="space-y-2">
              <Label htmlFor="match_day">Match Day Payment (UGX) *</Label>
              <Input
                id="match_day"
                type="number"
                placeholder="Enter match day payment"
                value={formData.match_day}
                onChange={(e) => handleChange("match_day", e.target.value)}
                min="0"
                step="1000"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Player"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditPlayerModal