"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, CalendarDays, Calendar, TrendingUp, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface PaymentStats {
  annual_total: number
  monthly_total: number
  pitch_total: number
  matchday_total: number
  total_amount: number
  total_payments: number
}

export function PaymentSummary() {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Helper function to get session headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    if (typeof window !== "undefined") {
      const sessionId = localStorage.getItem("session_id")
      if (sessionId) {
        headers["Authorization"] = `Session ${sessionId}`
      }
    }
    
    return headers
  }

  useEffect(() => {
    const loadPaymentStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log("🔍 Fetching payments from:", `${API_BASE_URL}/api/payments?limit=100`)
        
        // Fetch all payments to calculate statistics (limit to 100)
        const response = await fetch(`${API_BASE_URL}/api/payments?limit=100`, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        })

        console.log("📡 Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ API Error:", errorText)
          
          // Check if it's a 404 (endpoint doesn't exist)
          if (response.status === 404) {
            throw new Error("Payments API endpoint not found. Please ensure the payments router is properly configured.")
          }
          
          // Check if it's a 401 (authentication issue)
          if (response.status === 401) {
            throw new Error("Authentication failed. Please try logging in again.")
          }
          
          throw new Error(`API Error (${response.status}): ${errorText || 'Failed to load payment statistics'}`)
        }

        const payments = await response.json()
        console.log("✅ Payments loaded:", payments.length, "payments")
        
        // Calculate statistics
        const stats: PaymentStats = {
          annual_total: 0,
          monthly_total: 0,
          pitch_total: 0,
          matchday_total: 0,
          total_amount: 0,
          total_payments: payments.length
        }

        payments.forEach((payment: any) => {
          const amount = parseFloat(payment.amount) || 0
          stats.total_amount += amount

          switch (payment.payment_type) {
            case 'annual':
              stats.annual_total += amount
              break
            case 'monthly':
              stats.monthly_total += amount
              break
            case 'pitch':
              stats.pitch_total += amount
              break
            case 'matchday':
              stats.matchday_total += amount
              break
          }
        })

        console.log("📊 Calculated stats:", stats)
        setStats(stats)
      } catch (error) {
        console.error("❌ Error loading payment statistics:", error)
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setError(errorMessage)
        
        toast({
          title: "Error Loading Payments",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPaymentStats()
  }, [toast])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="dashboard-card border-0">
            <CardContent className="p-0">
              <div className="flex items-center justify-center p-4 md:p-6 h-28 md:h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="dashboard-card border-0 col-span-full">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-center text-center">
              <div>
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-600 mb-1">Failed to Load Payment Data</p>
                <p className="text-xs text-gray-500 break-words">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Show placeholder cards */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="dashboard-card border-0">
            <CardContent className="p-0">
              <div className="flex items-center p-4 md:p-6 min-h-[112px] md:min-h-[128px]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">--</p>
                  <div className="text-xl md:text-2xl font-bold text-gray-300 truncate">UGX 0</div>
                  <p className="text-xs text-gray-400 mt-1">No data available</p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ml-3">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Success state with data
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="dashboard-card border-0">
          <CardContent className="p-4 md:p-6 text-center text-gray-500">
            No payment data available
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="dashboard-card border-0">
        <CardContent className="p-0">
          <div className="flex items-center p-4 md:p-6 min-h-[112px] md:min-h-[128px]">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">Annual Subscriptions</p>
              <div className="text-xl md:text-2xl font-bold truncate">UGX {formatAmount(stats.annual_total)}</div>
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Yearly payments</span>
              </p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0 ml-3">
              <Calendar className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
          <div className="h-2 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
        </CardContent>
      </Card>

      <Card className="dashboard-card border-0">
        <CardContent className="p-0">
          <div className="flex items-center p-4 md:p-6 min-h-[112px] md:min-h-[128px]">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Subscriptions</p>
              <div className="text-xl md:text-2xl font-bold truncate">UGX {formatAmount(stats.monthly_total)}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <CalendarDays className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Monthly payments</span>
              </p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white flex-shrink-0 ml-3">
              <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
          <div className="h-2 w-full bg-gradient-to-r from-green-400 to-green-600"></div>
        </CardContent>
      </Card>

      <Card className="dashboard-card border-0">
        <CardContent className="p-0">
          <div className="flex items-center p-4 md:p-6 min-h-[112px] md:min-h-[128px]">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">Pitch Payments</p>
              <div className="text-xl md:text-2xl font-bold truncate">UGX {formatAmount(stats.pitch_total)}</div>
              <p className="text-xs text-purple-600 mt-1 flex items-center">
                <CreditCard className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Training sessions</span>
              </p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white flex-shrink-0 ml-3">
              <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
          <div className="h-2 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
        </CardContent>
      </Card>

      <Card className="dashboard-card border-0">
        <CardContent className="p-0">
          <div className="flex items-center p-4 md:p-6 min-h-[112px] md:min-h-[128px]">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Balance</p>
              <div className="text-xl md:text-2xl font-bold truncate">UGX {formatAmount(stats.total_amount)}</div>
              <p className="text-xs text-orange-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{stats.total_payments} payments</span>
              </p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white flex-shrink-0 ml-3">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
            </div>
          </div>
          <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
        </CardContent>
      </Card>
    </div>
  )
}