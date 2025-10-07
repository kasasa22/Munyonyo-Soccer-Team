"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { SideNav } from "@/components/side-nav"
import { Loader2 } from "lucide-react"

interface AppContentProps {
  children: React.ReactNode
}

// Loading component
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export function AppContent({ children }: AppContentProps) {
  const { isInitialized, isLoggedIn } = useAuth()
  const pathname = usePathname()

  // Show loading screen while auth is initializing
  if (!isInitialized) {
    return <LoadingScreen />
  }

  // If user is on login page, show just the login page without sidebar
  if (pathname === "/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  // If user is logged in, show the app with sidebar
  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SideNav />
        <div className="flex-1 w-full">{children}</div>
      </div>
    )
  }

  // If user is not logged in and not on login page, show loading
  // (this should rarely happen as the auth provider will redirect)
  return <LoadingScreen />
}