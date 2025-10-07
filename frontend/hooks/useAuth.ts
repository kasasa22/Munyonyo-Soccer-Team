// hooks/useAuth.ts - Custom hook for authentication

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authAPI, authStore, User, LoginCredentials } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

interface UseAuthReturn {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  hasRole: (role: string | string[]) => boolean
  isAdmin: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedUser = authStore.getUser()
      const storedIsLoggedIn = authStore.isLoggedIn()
      
      setUser(storedUser)
      setIsLoggedIn(storedIsLoggedIn)
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Verify authentication with backend
  const checkAuth = useCallback(async () => {
    if (!authStore.isLoggedIn()) {
      setIsLoading(false)
      return
    }

    try {
      const currentUser = await authAPI.getCurrentUser()
      setUser(currentUser)
      setIsLoggedIn(true)
      
      // Update stored user info
      authStore.setAuth(currentUser)
    } catch (error) {
      console.error("Auth verification failed:", error)
      // Clear invalid auth state
      authStore.clearAuth()
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login(credentials)
      
      // Store auth state
      authStore.setAuth(response.user, response.session_id)
      
      setUser(response.user)
      setIsLoggedIn(true)
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.name}!`,
      })
      
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authAPI.logout()
      
      // Clear local state
      setUser(null)
      setIsLoggedIn(false)
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
      
      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Clear state anyway
      authStore.clearAuth()
      setUser(null)
      setIsLoggedIn(false)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  // Check if user has specific role(s)
  const hasRole = useCallback((role: string | string[]) => {
    if (!user) return false
    
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    
    return user.role === role
  }, [user])

  // Check if user is admin
  const isAdmin = user?.role === "admin"

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkAuth,
    hasRole,
    isAdmin,
  }
}