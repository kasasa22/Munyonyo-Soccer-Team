"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function TeamSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    teamName: "FC United",
    location: "Kampala, Uganda",
    foundedYear: "2010",
    description: "A community football team focused on developing local talent and promoting sportsmanship.",
    contactEmail: "info@fcunited.com",
    contactPhone: "+256 700 123456",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Team settings updated",
        description: "Your team information has been updated successfully.",
      })
    }, 1000)
  }

  return (
    <div className="grid gap-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>Update your team's basic information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input id="teamName" name="teamName" value={formData.teamName} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input id="foundedYear" name="foundedYear" value={formData.foundedYear} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Team Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </div>
            <div className="mt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Update your team's contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
              </div>
            </div>
            <div className="mt-6">
              <Button type="submit">Update Contact Info</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
