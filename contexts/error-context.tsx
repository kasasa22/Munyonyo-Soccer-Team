// frontend/contexts/error-context.tsx
"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface ErrorContextType {
  handleError: (error: any, context?: string) => void
  clearErrors: () => void
  errors: ErrorInfo[]
}

interface ErrorInfo {
  id: string
  message: string
  context?: string
  timestamp: Date
  severity: 'error' | 'warning' | 'info'
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const { toast } = useToast()

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error in ${context || 'Unknown context'}:`, error)
    
    let errorMessage = 'An unexpected error occurred'
    let errorCode = 'UNKNOWN_ERROR'
    
    // Parse different error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error - please check your connection'
      errorCode = 'NETWORK_ERROR'
    } else if (error?.response?.data?.detail) {
      errorMessage = error.response.data.detail
      errorCode = error.response.data.error_code || 'API_ERROR'
    } else if (error?.detail) {
      errorMessage = error.detail
      errorCode = error.error_code || 'API_ERROR'
    } else if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    const errorInfo: ErrorInfo = {
      id: Date.now().toString(),
      message: errorMessage,
      context,
      timestamp: new Date(),
      severity: 'error'
    }

    setErrors(prev => [...prev, errorInfo])
    
    toast({
      title: `Error${context ? ` in ${context}` : ''}`,
      description: errorMessage,
      variant: 'destructive',
    })
  }, [toast])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  return (
    <ErrorContext.Provider value={{ handleError, clearErrors, errors }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within ErrorProvider')
  }
  return context
}