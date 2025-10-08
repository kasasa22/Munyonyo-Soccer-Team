"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import Link from "next/link"

// API configuration
const API_BASE_URL = ""

interface UserData {
  name: string
  email: string
  role: string
  status: string
  password: string
}

export function AddUserForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "active",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError("")
  }

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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("User name is required")
      return false
    }

    if (!formData.email.trim()) {
      setError("Email address is required")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.role) {
      setError("Please select a user role")
      return false
    }

    if (!formData.password.trim()) {
      setError("Password is required")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    return true
  }

  const extractErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, any>
      if (typeof errorObj.detail === 'string') {
        return errorObj.detail
      }
      if (typeof errorObj.message === 'string') {
        return errorObj.message
      }
    }
    
    return "Failed to create user. Please try again."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Clear previous errors
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Prepare data for API
      const userData: UserData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        status: formData.status,
        password: formData.password,
      }

      // Make API call to create user
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        let errorMessage = "Failed to create user"
        
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (jsonError) {
          // If response is not JSON, use status-based message
        }
        
        // Provide more specific error messages
        if (response.status === 409 || errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
          errorMessage = "This email address is already registered. Please use a different email."
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to create users. Please contact an administrator."
        } else if (response.status === 401) {
          errorMessage = "Your session has expired. Please log in again."
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later."
        }
        
        throw new Error(errorMessage)
      }

      const createdUser = await response.json()

      toast({
        title: "User created successfully",
        description: `${formData.name} has been added to the system.`,
      })

      // Redirect to users list
      router.push("/users")

    } catch (error) {
      const errorMessage = extractErrorMessage(error)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full system access - can manage users, players, payments, and all settings"
      case "manager":
        return "Can manage players, record payments, and view reports"
      case "treasurer":
        return "Can record payments, manage expenses, and view financial reports"
      case "viewer":
        return "Read-only access - can view players, payments, and reports"
      default:
        return ""
    }
  }

  return (
    <DashboardShell>
      <div className="flex items-center">
        <Link href="/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
      </div>
      <DashboardHeader heading="Add New User" text="Create a new user account and assign role permissions" />
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Enter the user details and assign appropriate role permissions</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter user's full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Must be unique - each user needs a different email</p>
                </div>
              </div>
            </div>

            {/* Role and Status */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Role & Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role">User Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.role && (
                    <p className="text-xs text-gray-600 mt-1">
                      {getRoleDescription(formData.role)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Default: Active</p>
                </div>
              </div>
            </div>

            {/* Password Setup */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Password Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full w-10 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Permissions Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Role Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Administrator</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Manage all users and roles</li>
                    <li>• Full access to all features</li>
                    <li>• View system sessions</li>
                    <li>• Export all data</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Manager</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Manage players</li>
                    <li>• Record payments</li>
                    <li>• View all reports</li>
                    <li>• Manage expenses</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Treasurer</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Record payments</li>
                    <li>• Manage expenses</li>
                    <li>• View financial reports</li>
                    <li>• Export payment data</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Viewer</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• View players</li>
                    <li>• View payments</li>
                    <li>• View reports</li>
                    <li>• Read-only access</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creating User..." : "Create User"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/users")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

export default AddUserForm