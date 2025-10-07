"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Calendar as CalendarIcon, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const expenseCategories = [
  "Facilities",
  "Equipment", 
  "Food & Drinks",
  "Transport",
  "Medical",
  "Officials",
]

interface ValidationError {
  field: string
  message: string
}

export function ExpenseForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    amount: "",
  })

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

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (error) setError("")
    if (validationErrors.length > 0) {
      setValidationErrors(prev => prev.filter(err => err.field !== name))
    }
  }

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    
    // Clear date validation error
    if (validationErrors.some(err => err.field === 'date')) {
      setValidationErrors(prev => prev.filter(err => err.field !== 'date'))
    }
  }

  const validateField = (fieldName: string, value: any): string | null => {
    switch (fieldName) {
      case 'description':
        return !value || !value.trim() ? "Description is required" : null
      case 'category':
        return !value ? "Please select a category" : null
      case 'amount':
        if (!value) return "Amount is required"
        const numValue = parseFloat(value)
        if (isNaN(numValue) || numValue <= 0) return "Amount must be greater than 0"
        return null
      case 'date':
        return !value ? "Please select a date" : null
      default:
        return null
    }
  }

  const validateForm = () => {
    const errors: ValidationError[] = []
    
    const descriptionError = validateField('description', formData.description)
    if (descriptionError) errors.push({ field: 'description', message: descriptionError })
    
    const categoryError = validateField('category', formData.category)
    if (categoryError) errors.push({ field: 'category', message: categoryError })
    
    const amountError = validateField('amount', formData.amount)
    if (amountError) errors.push({ field: 'amount', message: amountError })
    
    const dateError = validateField('date', date)
    if (dateError) errors.push({ field: 'date', message: dateError })
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const getFieldError = (fieldName: string) => {
    return validationErrors.find(err => err.field === fieldName)?.message
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
    
    return "Failed to record expense. Please try again."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setError("")
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const expenseData = {
        description: formData.description.trim(),
        category: formData.category,
        amount: parseFloat(formData.amount),
        expense_date: format(date!, "yyyy-MM-dd"),
      }

      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(expenseData),
      })

      if (!response.ok) {
        let errorMessage = "Failed to record expense"
        
        try {
          const errorData = await response.json()
          
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map(err => err.msg || err.message || String(err)).join(', ')
            } else {
              errorMessage = JSON.stringify(errorData.detail)
            }
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (jsonError) {
          // Response is not JSON
        }
        
        // Provide more specific error messages
        if (response.status === 401) {
          errorMessage = "Your session has expired. Please log in again."
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to record expenses. Please contact an administrator."
        } else if (response.status === 422) {
          errorMessage = "Invalid expense data. Please check all fields and try again."
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later."
        }
        
        throw new Error(errorMessage)
      }

      const createdExpense = await response.json()

      toast({
        title: "Success!",
        description: `Expense of UGX ${parseFloat(formData.amount).toLocaleString()} has been recorded successfully.`,
      })

      // Redirect to expenses list
      router.push("/expenses")

    } catch (error) {
      const errorMessage = extractErrorMessage(error)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Enter the expense information below. Select the date when this expense occurred.
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {/* Main Error Display */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Validation Summary */}
            {submitAttempted && validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Please fix the following errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error.message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Date Selection */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="mb-4">
                <h3 className="font-medium text-blue-900">Expense Date</h3>
                <p className="text-sm text-blue-700">Select the date when this expense occurred</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className={cn(getFieldError('date') && "text-red-600")}>
                  Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white",
                        !date && "text-muted-foreground",
                        getFieldError('date') && "border-red-300 focus:border-red-500"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {getFieldError('date') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('date')}
                  </p>
                )}
              </div>
            </div>

            {/* Expense Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-2">
                <Label htmlFor="description" className={cn(getFieldError('description') && "text-red-600")}>
                  Description *
                </Label>
                <Input
                  id="description"
                  placeholder="e.g., Pitch Rental"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  disabled={isLoading}
                  className={cn(
                    "w-full",
                    getFieldError('description') && "border-red-300 focus:border-red-500"
                  )}
                />
                {getFieldError('description') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('description')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className={cn(getFieldError('category') && "text-red-600")}>
                  Category *
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleChange("category", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn(
                    "w-full",
                    getFieldError('category') && "border-red-300 focus:border-red-500"
                  )}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError('category') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('category')}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="amount" className={cn(getFieldError('amount') && "text-red-600")}>
                  Amount (UGX) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  required
                  disabled={isLoading}
                  className={cn(
                    "w-full",
                    getFieldError('amount') && "border-red-300 focus:border-red-500"
                  )}
                />
                {getFieldError('amount') && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('amount')}
                  </p>
                )}
                {formData.amount && !getFieldError('amount') && parseFloat(formData.amount) > 0 && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    UGX {parseFloat(formData.amount).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Recording..." : "Record Expense"}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => router.push("/expenses")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}