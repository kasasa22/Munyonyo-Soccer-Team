"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading, isLoggedIn } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/")
    }
  }, [isLoggedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Clear previous errors
    
    try {
      await login({
        email: email.trim(),
        password: password,
      })
    } catch (error) {
      // Robust error message extraction
      let errorMessage = "Invalid email or password. Please check your credentials and try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        // Handle object errors by extracting message
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message
        } else if ('detail' in error && typeof error.detail === 'string') {
          errorMessage = error.detail
        } else if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error
        }
        // If we can't extract a message, use default
      }
      
      setError(errorMessage)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-blue-50"></div>
      <Card className="w-full max-w-md relative z-10 border-0 shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <CardHeader className="space-y-1 pt-6">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
                <path d="M12 22a10 10 0 0 1-10-10"/>
                <path d="M8 12h8"/>
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Munyonyo Soccer Team</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the team management system
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 w-11 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            
            {/* Error display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full h-11 text-base" 
              disabled={isLoading || !email.trim() || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}