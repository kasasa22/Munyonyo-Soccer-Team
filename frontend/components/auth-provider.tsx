"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// API configuration - for Docker environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "treasurer" | "viewer"
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  isInitialized: boolean 
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  hasRole: (role: string | string[]) => boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  
  if (typeof window !== "undefined") {
    const sessionId = localStorage.getItem("session_id")
    if (sessionId) {
      headers["Authorization"] = `Session ${sessionId}`
    }
  }

  return headers
}

const authStore = {
  isLoggedIn(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem("isLoggedIn") === "true"
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  clearAuth(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    localStorage.removeItem("session_id")
  },

  setAuth(user: User, sessionId?: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("user", JSON.stringify(user))
    if (sessionId) {
      localStorage.setItem("session_id", sessionId)
    }
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const publicRoutes = ["/login"]

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we have stored auth data
      const storedUser = authStore.getUser()
      const hasStoredLogin = authStore.isLoggedIn()
      
      if (hasStoredLogin && storedUser) {
        setUser(storedUser)
        setIsLoggedIn(true)
        
        // Verify with server
        await checkAuthWithServer()
      } else {
        setIsInitialized(true)
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const checkAuthWithServer = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
      })

      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}`)
      }

      const currentUser = await response.json()
      
      // Update with fresh user data from server
      setUser(currentUser)
      setIsLoggedIn(true)
      authStore.setAuth(currentUser)
    } catch (error) {
      // Clear invalid auth data
      authStore.clearAuth()
      setUser(null)
      setIsLoggedIn(false)
    } finally {
      setIsInitialized(true)
      setIsLoading(false)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    if (!authStore.isLoggedIn()) {
      setIsLoading(false)
      return
    }

    await checkAuthWithServer()
  }, [checkAuthWithServer])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    
    const loginUrl = `${API_BASE_URL}/api/users/login`
    
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        let errorMessage = "Login failed. Please check your credentials and try again."
        
        try {
          const errorData = await response.json()
          // Handle different error response formats
          if (typeof errorData === 'string') {
            errorMessage = errorData
          } else if (errorData && typeof errorData === 'object') {
            if (errorData.detail && typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            } else if (errorData.message && typeof errorData.message === 'string') {
              errorMessage = errorData.message
            } else if (errorData.error && typeof errorData.error === 'string') {
              errorMessage = errorData.error
            }
          }
        } catch (jsonError) {
          // If response is not JSON, use status-based message
        }
        
        // Provide more specific error messages based on status code
        if (response.status === 401) {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (response.status === 403) {
          errorMessage = "Your account is suspended or inactive. Please contact an administrator."
        } else if (response.status === 404) {
          errorMessage = "No account found with this email address."
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later."
        }
        
        // Ensure we always throw a proper Error with string message
        const finalError = new Error(String(errorMessage))
        throw finalError
      }

      const data = await response.json()
      
      authStore.setAuth(data.user, data.session_id)
      setUser(data.user)
      setIsLoggedIn(true)
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`,
      })
      
      router.push("/")
    } catch (error) {
      let errorMessage = "Login failed. Please try again."
      
      if (error instanceof TypeError) {
        errorMessage = "Cannot connect to server. Please check your internet connection and try again."
      } else if (error instanceof Error && error.message) {
        errorMessage = String(error.message)
      }
      
      // Always throw an Error object with a guaranteed string message
      const finalError = new Error(String(errorMessage))
      throw finalError
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
      })
      
      authStore.clearAuth()
      setUser(null)
      setIsLoggedIn(false)
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
      
      router.push("/login")
    } catch (error) {
      authStore.clearAuth()
      setUser(null)
      setIsLoggedIn(false)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  const hasRole = useCallback((role: string | string[]) => {
    if (!user) return false
    
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    
    return user.role === role
  }, [user])

  const isAdmin = user?.role === "admin"

  // Redirect logic after initialization
  useEffect(() => {
    // Don't do anything until auth is initialized
    if (!isInitialized) {
      return
    }

    const isPublicRoute = publicRoutes.includes(pathname)
    
    if (!isLoggedIn && !isPublicRoute) {
      router.push("/login")
    } else if (isLoggedIn && pathname === "/login") {
      router.push("/")
    }
  }, [isInitialized, isLoggedIn, pathname, router])

  const value = {
    user,
    isLoggedIn,
    isLoading,
    isInitialized,
    login,
    logout,
    checkAuth,
    hasRole,
    isAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}