"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "./auth-provider"
import { BarChart3, Users, CreditCard, Receipt, Home, LogOut, Settings, Menu, X, UserCheck } from "lucide-react"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

export function SideNav() {
  const pathname = usePathname()
  // Updated: Use the correct auth properties from your session-based auth
  const { isLoggedIn, user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()

  // Don't render the sidebar on the login page or if not authenticated
  if (pathname === "/login" || !isLoggedIn) {
    return null
  }

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/", 
      icon: <Home className="mr-2 h-5 w-5" />,
    },
    {
      title: "Players",
      href: "/players",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: <CreditCard className="mr-2 h-5 w-5" />,
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: <Receipt className="mr-2 h-5 w-5" />,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <BarChart3 className="mr-2 h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/users",
      icon: <UserCheck className="mr-2 h-5 w-5" />, // Changed icon to differentiate from Players
      adminOnly: true,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="mr-2 h-5 w-5" />,
    },
  ]

  // Mobile menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Updated: Async logout handler
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user?.role?.toLowerCase() === "admin"
  }

  // Filter navigation items based on user role
  const getVisibleNavItems = () => {
    return navItems.filter(item => {
      if (item.adminOnly) {
        return isAdmin()
      }
      return true
    })
  }

  // Mobile header
  const MobileHeader = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-30 border-b flex items-center justify-between px-4">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
        Munyonyo Soccer Team
      </h2>
      <Button variant="ghost" size="icon" onClick={toggleMenu} className="lg:hidden">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  )

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <MobileHeader />
        <div
          className={cn(
            "fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-20 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Munyonyo Soccer Team
              </h2>
              {/* User info display */}
              {user && (
                <div className="mt-3 flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role || 'user'}</p>
                 
                  </div>
                </div>
              )}
            </div>
            <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
              <div className="flex flex-col gap-1 py-4 px-3">
                {getVisibleNavItems().map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start py-6 text-base",
                        pathname === item.href
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "hover:bg-blue-50 hover:text-blue-600",
                      )}
                    >
                      {item.icon}
                      {item.title}
                      {/* Show admin badge for admin-only items */}
                      {item.adminOnly && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start py-6 text-base hover:bg-red-50 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-16 lg:pt-0"></div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className="hidden lg:flex flex-col h-screen border-r bg-white shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Munyonyo Soccer Team
        </h2>
        {/* User info display for desktop */}
        {user && (
          <div className="mt-4 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'Unknown User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role || 'user'}</p>
            
            </div>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-1 py-4">
          {getVisibleNavItems().map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start py-6 text-base",
                  pathname === item.href ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50 hover:text-blue-600",
                )}
              >
                {item.icon}
                {item.title}
                {/* Show admin badge for admin-only items */}
                {item.adminOnly && (
                  <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start py-6 text-base hover:bg-red-50 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}