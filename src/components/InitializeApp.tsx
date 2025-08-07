/**
 * InitializeApp Component
 * 
 * This component handles the initial setup of the FinWiseAI application.
 * It creates a default user profile if none exists and manages the
 * application's initial state. It's rendered at the root level but
 * doesn't display any visible UI.
 */

'use client'

import { useEffect, useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { useApiStatus } from '@/hooks/useApiStatus'
import { User } from '@/types/financial'

/**
 * InitializeApp Component
 * 
 * Handles the initialization of the application by:
 * - Creating a default user profile if none exists
 * - Setting up user preferences and settings
 * - Ensuring the application has a valid user context
 * 
 * This component runs once when the app loads and doesn't render
 * any visible UI elements.
 */
export function InitializeApp() {
  const { user, setUser } = useFinancialStore()

  useEffect(() => {
    /**
     * Initialize user profile
     * 
     * Creates a default user profile with basic preferences
     * if no user exists in the store. This ensures the app
     * always has a valid user context for functionality.
     */
    const initializeUser = () => {
      // Only create a basic user profile if none exists
      if (!user) {
        const demoUser: User = {
          id: 'user_001',
          name: 'User',
          email: 'user@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          preferences: {
            currency: 'USD',
            timeZone: 'America/New_York',
            budgetAlerts: true,
            investmentAlerts: true,
            aiInsights: true,
            dataSync: true
          }
        }

        setUser(demoUser)
      }
    }

    initializeUser()
  }, [user, setUser])

  // This component doesn't render anything
  return null
}

/**
 * APIStatusIndicator Component
 * 
 * Displays real-time status of API connections (Plaid and OpenAI)
 * in a floating indicator at the bottom-right of the screen.
 * Provides visual feedback about the application's connectivity
 * and configuration status.
 */
export function APIStatusIndicator() {
  const { plaid: plaidStatus, openai: openaiStatus } = useApiStatus()
  const [key, setKey] = useState(0)

  /**
   * Force re-render when status changes
   * 
   * Updates the component every second to ensure
   * the status display is current and responsive
   * to API connection changes.
   */
  useEffect(() => {
    const timer = setTimeout(() => setKey(prev => prev + 1), 1000)
    return () => clearTimeout(timer)
  }, [plaidStatus.connected, openaiStatus.connected])

  return (
    <div key={key} className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 text-xs space-y-3 max-w-sm">
      {/* Header */}
      <div className="font-semibold text-slate-700 border-b pb-2">API Configuration Status</div>
      
      {/* API Status Indicators */}
      <div className="space-y-2">
        {/* Plaid API Status */}
        <div className="flex items-start space-x-2">
          <div className={`w-2 h-2 rounded-full mt-1 ${plaidStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <div className="font-medium">Plaid: {plaidStatus.connected ? 'Connected' : 'Not Connected'}</div>
            <div className="text-slate-600 text-xs leading-relaxed">{plaidStatus.message}</div>
          </div>
        </div>
        
        {/* OpenAI API Status */}
        <div className="flex items-start space-x-2">
          <div className={`w-2 h-2 rounded-full mt-1 ${openaiStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <div className="font-medium">OpenAI: {openaiStatus.connected ? 'Connected' : 'Not Connected'}</div>
            <div className="text-slate-600 text-xs leading-relaxed">{openaiStatus.message}</div>
          </div>
        </div>
      </div>

      {/* Warning for Limited Functionality */}
      {(!plaidStatus.connected || !openaiStatus.connected) && (
        <div className="pt-2 border-t">
          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
            <strong>⚠️ Limited Functionality:</strong> Some features require API configuration. 
            See SETUP.md for instructions.
          </div>
        </div>
      )}
    </div>
  )
} 