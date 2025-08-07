/**
 * PlaidLinkButton Component - Secure bank account connection interface
 * Handles Plaid Link integration for connecting financial institutions
 */

'use client'

import { useState, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { useFinancialStore } from '@/store/financialStore'
import { useApiStatus } from '@/hooks/useApiStatus'
import { Settings, CheckCircle, AlertCircle, CreditCard, Loader2, Plus } from 'lucide-react'

interface PlaidLinkButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PlaidLinkButton({ 
  variant = 'primary', 
  size = 'md',
  className = ''
}: PlaidLinkButtonProps) {
  // Connection state management
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const { plaid: plaidStatus } = useApiStatus()

  const { user, connectInstitution, isConnecting: storeConnecting } = useFinancialStore()

  // Configure Plaid Link with success/error handlers
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token: string, metadata: any) => {
      console.log('🔗 Plaid Link success:', { public_token, metadata })
      
      try {
        console.log('🔄 Starting institution connection...')
        // Use the store's connectInstitution method
        const success = await connectInstitution(public_token)
        
        console.log('✅ Institution connection result:', success)
        
        if (success) {
          setConnectionStatus('success')
          console.log('🎉 Bank account connected successfully!')
          // Refresh the page or update the store to show connected accounts
          window.location.reload()
        } else {
          throw new Error('Failed to connect institution - store returned false')
        }
      } catch (error) {
        console.error('❌ Error connecting institution:', error)
        setErrorMessage(`Failed to complete bank connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setConnectionStatus('error')
      } finally {
        setIsConnecting(false)
        setLinkToken(null) // Reset token after use
      }
    },
    onExit: (err: any, metadata: any) => {
      console.log('🚪 Plaid Link exit:', { err, metadata })
      if (err) {
        console.error('❌ Plaid Link error:', err)
        setErrorMessage(`Bank connection was cancelled or failed: ${err.error_message || err.message || 'Unknown error'}`)
        setConnectionStatus('error')
      }
      setIsConnecting(false)
      setLinkToken(null) // Reset token after use
    },
    onEvent: (eventName: string, metadata: any) => {
      console.log('📡 Plaid Link event:', eventName, metadata)
    },
  })

  // Handle Plaid connection initiation
  const handlePlaidConnection = async () => {
    if (!user) {
      setErrorMessage('Please set up your user profile first')
      setConnectionStatus('error')
      return
    }

    if (!plaidStatus.connected) {
      setErrorMessage('Plaid API is not configured. Please add your API keys to .env.local')
      setConnectionStatus('error')
      return
    }

    setIsConnecting(true)
    setConnectionStatus('idle')
    setErrorMessage('')

    try {
      // Get link token from our API
      const linkTokenResponse = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const linkTokenData = await linkTokenResponse.json()

      if (!linkTokenData.success) {
        throw new Error(linkTokenData.error || 'Failed to create link token')
      }

      // Set the link token to trigger Plaid Link
      setLinkToken(linkTokenData.link_token)
    } catch (error) {
      console.error('Error connecting to Plaid:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed. Please check your configuration.')
      setConnectionStatus('error')
      setIsConnecting(false)
    }
  }

  // Open Plaid Link when token is ready
  useEffect(() => {
    if (linkToken && ready) {
      open()
    }
  }, [linkToken, ready, open])

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700',
    secondary: 'bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
  }

  const isLoading = isConnecting || storeConnecting

  if (!plaidStatus.connected) {
    return (
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">API Configuration Required</h3>
              <p className="text-sm text-amber-700 mt-1">{plaidStatus.message}</p>
              <div className="mt-3 text-xs text-amber-600">
                <strong>Setup Instructions:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Create a Plaid developer account at dashboard.plaid.com</li>
                  <li>Get your Client ID and Secret keys</li>
                  <li>Add them to your .env.local file</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Success Message */}
      {connectionStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Bank Account Connected!</h3>
              <p className="text-sm text-green-700">Your bank account has been successfully connected.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {connectionStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Connection Failed</h3>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connect Button */}
      <button
        onClick={handlePlaidConnection}
        disabled={isLoading}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
          rounded-xl font-medium transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center space-x-2
          shadow-lg hover:shadow-xl transform hover:scale-[1.02]
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span>Connect Bank Account</span>
          </>
        )}
      </button>

      {/* Connection Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">Secure Bank Connection</h3>
            <p className="text-sm text-blue-700 mt-1">
              Connect your bank accounts securely through Plaid. Your credentials are never stored and all data is encrypted.
            </p>
            <div className="mt-2 text-xs text-blue-600">
              <strong>Supported:</strong> Checking, Savings, Credit Cards, Investment Accounts
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component for showing connected institutions
export function ConnectedInstitutions() {
  const { connectedInstitutions, removeInstitution } = useFinancialStore()

  if (connectedInstitutions.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center">
        <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-700 mb-1">No Connected Accounts</h3>
        <p className="text-sm text-slate-600">Connect your bank accounts to start tracking your finances.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Connected Accounts</h3>
      <div className="space-y-3">
        {connectedInstitutions.map((institution) => (
          <div 
            key={institution.id} 
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{institution.institution_name}</p>
                <p className="text-sm text-slate-600">
                  {institution.accounts.length} account{institution.accounts.length !== 1 ? 's' : ''} connected
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                institution.sync_status === 'active' ? 'bg-green-100 text-green-700' : 
                institution.sync_status === 'error' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  institution.sync_status === 'active' ? 'bg-green-500' : 
                  institution.sync_status === 'error' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}></div>
                <span className="capitalize">{institution.sync_status.replace('_', ' ')}</span>
              </div>
              
              <button 
                onClick={() => removeInstitution(institution.id)}
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 