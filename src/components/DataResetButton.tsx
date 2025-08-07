/**
 * DataResetButton Component - Development tool for clearing cached data
 * Allows developers to reset all stored financial data and reload the app
 */

'use client'

import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'

export function DataResetButton() {
  // Loading state for reset operation
  const [isResetting, setIsResetting] = useState(false)
  const { resetStore } = useFinancialStore()

  // Handle data reset with confirmation
  const handleReset = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will reset your local data but not affect your connected accounts.')) {
      return
    }

    setIsResetting(true)
    
    // Clear localStorage data
    localStorage.removeItem('financial-store')
    
    // Reset the store state
    resetStore()
    
    // Reload page after delay
    setTimeout(() => {
      setIsResetting(false)
      window.location.reload()
    }, 1000)
  }

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-1" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Data Issues?</h3>
          <p className="text-xs text-amber-700 mb-3">
            If you're seeing incorrect financial data, click below to clear cached calculations and reset the app.
          </p>
          <Button
            onClick={handleReset}
            disabled={isResetting}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isResetting ? (
              <>
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2" />
                Reset Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 