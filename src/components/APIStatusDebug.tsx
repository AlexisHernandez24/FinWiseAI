/**
 * APIStatusDebug Component - Development tool for checking API configuration
 * Shows environment variable status for debugging API connection issues
 */

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

export function APIStatusDebug() {
  // State to store environment variable status
  const [envVars, setEnvVars] = useState<{
    plaidClientId: string | undefined
    plaidSecret: string | undefined
    openaiKey: string | undefined
  }>({
    plaidClientId: undefined,
    plaidSecret: undefined,
    openaiKey: undefined
  })

  // Load environment variables on component mount
  useEffect(() => {
    // This will only work on the client side
    setEnvVars({
      plaidClientId: process.env.NEXT_PUBLIC_PLAID_CLIENT_ID || 'Not set (server-side only)',
      plaidSecret: process.env.NEXT_PUBLIC_PLAID_SECRET || 'Not set (server-side only)',
      openaiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'Not set (server-side only)'
    })
  }, [])

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
      <h3 className="font-semibold text-yellow-800 mb-2">🔍 Environment Variables Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>PLAID_CLIENT_ID:</strong> {envVars.plaidClientId ? 'Set' : 'Not set'}
        </div>
        <div>
          <strong>PLAID_SECRET:</strong> {envVars.plaidSecret ? 'Set' : 'Not set'}
        </div>
        <div>
          <strong>OPENAI_API_KEY:</strong> {envVars.openaiKey ? 'Set' : 'Not set'}
        </div>
        <div className="text-xs text-yellow-600 mt-2">
          Note: Environment variables are server-side only. Check browser console for server logs.
        </div>
      </div>
    </Card>
  )
} 