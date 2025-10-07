"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Receipt, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useMobile } from "@/hooks/use-mobile"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  match_day_date: string | null
  match_day_opponent: string | null
  match_day_venue: string | null
  created_at: string
}

export function ExpenseSummary() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const isMobile = useMobile(768)

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
    const loadRecentExpenses = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch(`${API_BASE_URL}/api/expenses?limit=10`, {
          method: "GET",
          headers: getAuthHeaders(),
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to load recent expenses")
        }

        const data = await response.json()
        setExpenses(data)
      } catch (error) {
        console.error("Error loading recent expenses:", error)
        toast({
          title: "Error",
          description: "Failed to load recent expenses",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadRecentExpenses()
  }, [toast])

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categoryColors: Record<string, string> = {
    Facilities: "bg-blue-100 text-blue-800",
    Equipment: "bg-green-100 text-green-800",
    "Food & Drinks": "bg-orange-100 text-orange-800",
    Transport: "bg-purple-100 text-purple-800",
    Medical: "bg-red-100 text-red-800",
    Officials: "bg-yellow-100 text-yellow-800",
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatMatchDay = (expense: Expense) => {
    if (!expense.match_day_date) return "No match day"
    
    const date = new Date(expense.match_day_date).toLocaleDateString('en-UG', {
      month: 'short',
      day: 'numeric'
    })
    
    if (expense.match_day_opponent) {
      return `${date} vs ${expense.match_day_opponent}`
    }
    
    return date
  }

  // Mobile card view for expenses
  const MobileExpenseList = () => (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{expense.description}</h3>
            <span className="font-medium">UGX {formatAmount(expense.amount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>{formatMatchDay(expense)}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                categoryColors[expense.category] || "bg-gray-100 text-gray-800"
              }`}
            >
              {expense.category}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {expense.match_day_venue && `Venue: ${expense.match_day_venue}`}
          </div>
        </div>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <Card className="dashboard-card border-0 overflow-visible">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg sm:text-xl font-bold">Recent Expenses</CardTitle>
          <CardDescription className="text-sm mt-1">Loading recent expenses...</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="dashboard-card border-0 overflow-visible">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold">Recent Expenses</CardTitle>
            <CardDescription className="text-sm mt-1">
              {expenses.length > 0 
                ? `Total expenses: UGX ${formatAmount(totalExpenses)}`
                : "No expenses recorded yet."
              }
            </CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-red-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No expenses yet</p>
            <p className="text-sm">Expenses will appear here once recorded</p>
          </div>
        ) : isMobile ? (
          <MobileExpenseList />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-white">
                  <TableHead className="font-medium">Description</TableHead>
                  <TableHead className="font-medium">Category</TableHead>
                  <TableHead className="font-medium">Match Day</TableHead>
                  <TableHead className="text-right font-medium">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          categoryColors[expense.category] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{formatMatchDay(expense)}</div>
                        {expense.match_day_venue && (
                          <div className="text-xs text-gray-500">{expense.match_day_venue}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      UGX {formatAmount(expense.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}