import { auth } from '@/lib/firebase'

/**
 * Sentinel API Client
 * Robust fetch wrapper with automatic token refresh and 401 retry logic.
 */
class APIClient {
  private async getHeaders(contentType = 'application/json') {
    const token = await auth.currentUser?.getIdToken()
    return {
      'Content-Type': contentType,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }
  }

  async fetch(url: string, options: RequestInit = {}) {
    const headers = await this.getHeaders()
    
    let response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    // Automatic Re-authentication on 401
    if (response.status === 401 && auth.currentUser) {
      console.warn('[Sentinel API] Session stale. Attempting token rotation...')
      
      // Force refresh token
      const newToken = await auth.currentUser.getIdToken(true)
      
      // Update cookie immediately
      document.cookie = `firebase_token=${newToken}; path=/; max-age=3600; SameSite=Lax; Secure`

      // Retry original request exactly once
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
        },
      })
    }

    return response
  }

  async get(url: string, options: RequestInit = {}) {
    return this.fetch(url, { ...options, method: 'GET' })
  }

  async post(url: string, data: any, options: RequestInit = {}) {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async patch(url: string, data: any, options: RequestInit = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new APIClient()
