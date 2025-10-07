// frontend/hooks/use-api.ts
import { useState, useCallback } from 'react'
import { useError } from '@/contexts/error-context'
import { apiClient } from '@/lib/api-client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })
  
  const { handleError } = useError()

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await apiCall()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      handleError(error, context)
      return null
    }
  }, [handleError])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}