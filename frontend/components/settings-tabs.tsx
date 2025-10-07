"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/profile-settings"
import { PaymentSettings } from "@/components/payment-settings"
import { useMobile } from "@/hooks/use-mobile"

export function SettingsTabs() {
  const isMobile = useMobile()

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className={`mb-6 ${isMobile ? "grid grid-cols-2 gap-2" : ""}`}>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        
      </TabsList>
      <TabsContent value="profile" className="mt-0">
        <ProfileSettings />
      </TabsContent>
   
    </Tabs>
  )
}