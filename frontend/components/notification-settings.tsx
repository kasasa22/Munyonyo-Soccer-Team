"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [notifications, setNotifications] = useState({
    email: {
      payments: true,
      newPlayers: true,
      reports: true,
      teamUpdates: false,
    },
    push: {
      payments: true,
      newPlayers: false,
      reports: false,
      teamUpdates: true,
    },
  })

  const handleSwitchChange = (channel: "email" | "push", setting: string, checked: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [setting]: checked,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      })
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure which email notifications you receive.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-payments">Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about payment confirmations and reminders
                  </p>
                </div>
                <Switch
                  id="email-payments"
                  checked={notifications.email.payments}
                  onCheckedChange={(checked) => handleSwitchChange("email", "payments", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-players">New Player Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive emails when new players are added to the team</p>
                </div>
                <Switch
                  id="email-players"
                  checked={notifications.email.newPlayers}
                  onCheckedChange={(checked) => handleSwitchChange("email", "newPlayers", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-reports">Report Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive emails when new reports are generated</p>
                </div>
                <Switch
                  id="email-reports"
                  checked={notifications.email.reports}
                  onCheckedChange={(checked) => handleSwitchChange("email", "reports", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-updates">Team Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about general team updates and announcements
                  </p>
                </div>
                <Switch
                  id="email-updates"
                  checked={notifications.email.teamUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("email", "teamUpdates", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>Configure which push notifications you receive on your devices.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-payments">Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications about payment confirmations and reminders
                  </p>
                </div>
                <Switch
                  id="push-payments"
                  checked={notifications.push.payments}
                  onCheckedChange={(checked) => handleSwitchChange("push", "payments", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-players">New Player Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications when new players are added to the team
                  </p>
                </div>
                <Switch
                  id="push-players"
                  checked={notifications.push.newPlayers}
                  onCheckedChange={(checked) => handleSwitchChange("push", "newPlayers", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-reports">Report Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications when new reports are generated
                  </p>
                </div>
                <Switch
                  id="push-reports"
                  checked={notifications.push.reports}
                  onCheckedChange={(checked) => handleSwitchChange("push", "reports", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-updates">Team Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications about general team updates and announcements
                  </p>
                </div>
                <Switch
                  id="push-updates"
                  checked={notifications.push.teamUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("push", "teamUpdates", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Saving..." : "Save Notification Settings"}
          </Button>
        </div>
      </div>
    </form>
  )
}
