// lib/auth.ts - Authentication utilities for frontend

const API_BASE_URL = ""

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

export interface LoginResponse {
  message: string
  user: User
  session_id?: string
}

// Authentication API calls
export const authAPI = {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Login failed")
    }

    return response.json()
  },

  // Logout user
  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/users/logout`, {
      method: "POST",
      credentials: "include", // Include cookies
      headers: {
        ...getAuthHeaders(),
      },
    })

    if (!response.ok) {
      console.warn("Logout request failed, but continuing with client-side cleanup")
    }

    // Clear local storage regardless of server response
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    localStorage.removeItem("session_id")
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "GET",
      credentials: "include", // Include cookies
      headers: {
        ...getAuthHeaders(),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get current user")
    }

    return response.json()
  },

  // Verify if user is authenticated
  async verifyAuth(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  },
}

// Helper function to get authentication headers
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  
  // Get session_id from localStorage for API calls
  const sessionId = localStorage.getItem("session_id")
  if (sessionId) {
    headers["Authorization"] = `Session ${sessionId}`
  }

  return headers
}

// Client-side auth state management
export const authStore = {
  // Check if user is logged in (client-side)
  isLoggedIn(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem("isLoggedIn") === "true"
  },

  // Get stored user info
  getUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  // Get session ID
  getSessionId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("session_id")
  },

  // Clear all auth data
  clearAuth(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    localStorage.removeItem("session_id")
  },

  // Store auth data
  setAuth(user: User, sessionId?: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("user", JSON.stringify(user))
    if (sessionId) {
      localStorage.setItem("session_id", sessionId)
    }
  },
}

// API wrapper with authentication
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Always include cookies
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  // If we get a 401, clear auth state
  if (response.status === 401) {
    authStore.clearAuth()
    // Optionally redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  return response
}

// Utility function to handle API errors
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred"
}