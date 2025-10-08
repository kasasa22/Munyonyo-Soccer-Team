// frontend/lib/api-client.ts
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errorCode?: string,
    public context?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  private async handleResponse<T>(response: Response, context?: string): Promise<T> {
    if (!response.ok) {
      let errorData: any = {}
      
      try {
        errorData = await response.json()
      } catch {
        // Response doesn't contain JSON
      }

      const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`
      const errorCode = errorData.error_code || `HTTP_${response.status}`
      
      throw new ApiError(response.status, errorMessage, errorCode, context)
    }

    try {
      return await response.json()
    } catch (error) {
      throw new ApiError(200, 'Invalid JSON response', 'INVALID_JSON', context)
    }
  }

  async get<T>(endpoint: string, context?: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      })
      
      return this.handleResponse<T>(response, context)
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(0, 'Network error', 'NETWORK_ERROR', context)
    }
  }

  async post<T>(endpoint: string, data: any, context?: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      })
      
      return this.handleResponse<T>(response, context)
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(0, 'Network error', 'NETWORK_ERROR', context)
    }
  }

  // Similar methods for PUT, DELETE, etc.
}

// Use empty string for Next.js API routes (relative paths)
export const apiClient = new ApiClient('')