/**
 * useApiStatus Hook - Monitors API connection status
 * Checks Plaid and OpenAI API connectivity and provides real-time status updates
 */

import { useState, useEffect } from 'react'

interface ApiStatus {
  plaid: {
    connected: boolean
    message: string
  }
  openai: {
    connected: boolean
    message: string
  }
}

export function useApiStatus() {
  // API status state management
  const [status, setStatus] = useState<ApiStatus>({
    plaid: { connected: false, message: 'Loading...' },
    openai: { connected: false, message: 'Loading...' }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch API status from server
    const fetchApiStatus = async () => {
      console.log('🔍 Fetching API status from /api/status...')
      try {
        const response = await fetch('/api/status')
        const data = await response.json()
        
        console.log('📡 API Status Response:', data)
        
        // Update status with server response
        if (data.success) {
          setStatus({
            plaid: {
              connected: data.plaid.connected,
              message: data.plaid.message
            },
            openai: {
              connected: data.openai.connected,
              message: data.openai.message
            }
          })
          console.log('✅ API Status Updated:', {
            plaid: data.plaid.connected ? 'Connected' : 'Not Connected',
            openai: data.openai.connected ? 'Connected' : 'Not Connected'
          })
        } else {
          console.error('❌ Failed to fetch API status:', data.error)
          setStatus({
            plaid: { connected: false, message: 'Error checking status' },
            openai: { connected: false, message: 'Error checking status' }
          })
        }
      } catch (error) {
        console.error('❌ Error fetching API status:', error)
        setStatus({
          plaid: { connected: false, message: 'Network error' },
          openai: { connected: false, message: 'Network error' }
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch immediately and retry after delays
    fetchApiStatus()
    
    // Retry after delays to ensure everything is loaded
    const timer1 = setTimeout(fetchApiStatus, 1000)
    const timer2 = setTimeout(fetchApiStatus, 3000)
    
    // Cleanup timers on unmount
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return { ...status, isLoading }
} 