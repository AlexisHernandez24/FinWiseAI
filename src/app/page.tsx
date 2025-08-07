/**
 * Dashboard Page Component
 * 
 * This is the main dashboard page that serves as the home screen for FinWiseAI.
 * It displays the user's financial overview, API connection status, and provides
 * access to key features like bank connections, financial goals, and AI insights.
 */

'use client'

import { useState, useEffect } from 'react'
import { FinancialSummary } from '@/components/dashboard/FinancialSummary'
import { PlaidLinkButton, ConnectedInstitutions } from '@/components/plaid/PlaidLinkButton'
import { GoalManager } from '@/components/goals/GoalManager'
import { useFinancialStore } from '@/store/financialStore'
import { useApiStatus } from '@/hooks/useApiStatus'
import { TrendingUp, AlertCircle, Settings, Target, Brain, CreditCard } from 'lucide-react'

/**
 * DashboardPage Component
 * 
 * Main dashboard that provides:
 * - Welcome message and API status overview
 * - Financial summary with key metrics
 * - Bank connection interface
 * - Financial goals management
 * - AI insights generation and display
 * 
 * The component adapts its content based on API connection status:
 * - Shows setup instructions when APIs aren't configured
 * - Displays full functionality when all APIs are connected
 */
export default function DashboardPage() {
  // Get financial data and actions from the global store
  const { user, accounts, transactions, goals, insights, generateInsights, isGeneratingInsights } = useFinancialStore()
  
  // Get API connection status for Plaid and OpenAI
  const { plaid: plaidStatus, openai: openaiStatus, isLoading } = useApiStatus()

  /**
   * Handle AI insights generation
   * Only generates insights if OpenAI is connected and there are transactions to analyze
   */
  const handleGenerateInsights = async () => {
    if (openaiStatus.connected && transactions.length > 0) {
      await generateInsights()
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section with Welcome Message and API Status */}
      <div className="relative overflow-hidden">
        {/* Background gradient for visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        
        {/* Hero content with welcome message and status indicators */}
        <div className="relative p-8 lg:p-12 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            {/* Left side: Welcome message and status */}
            <div className="space-y-4">
              {/* AI branding and tagline */}
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-white" />
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <Target className="h-4 w-4" />
                  <span>AI-Powered Financial Intelligence</span>
                </div>
              </div>
              
              {/* Personalized welcome message */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  Welcome to FinWiseAI
                </h1>
                <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                  {user ? `Hello ${user.name}! ` : 'Welcome! '}
                  {isLoading 
                    ? 'Checking API configuration...'
                    : plaidStatus.connected && openaiStatus.connected 
                    ? 'Your AI financial assistant is ready to help optimize your financial future.'
                    : 'Configure your API connections to unlock the full power of AI-driven financial insights.'
                  }
                </p>
              </div>
              
              {/* API connection status indicators */}
              <div className="flex items-center space-x-6 text-white/80 text-sm">
                {/* Plaid connection status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isLoading ? 'bg-yellow-400' : plaidStatus.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>Plaid: {isLoading ? 'Checking...' : plaidStatus.connected ? 'Connected' : 'Setup Required'}</span>
                </div>
                {/* OpenAI connection status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isLoading ? 'bg-yellow-400' : openaiStatus.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>OpenAI: {isLoading ? 'Checking...' : openaiStatus.connected ? 'Connected' : 'Setup Required'}</span>
                </div>
              </div>
            </div>
            
            {/* Right side: AI confidence meter (desktop only) */}
            <div className="hidden lg:block">
              <div className="relative w-32 h-32">
                {/* SVG circular progress indicator */}
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                  />
                  {/* Progress circle - shows readiness percentage */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray={`${isLoading ? 25 : plaidStatus.connected && openaiStatus.connected ? 95 : 25}, 100`}
                  />
                </svg>
                {/* Center text showing readiness percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {isLoading ? '...' : plaidStatus.connected && openaiStatus.connected ? '95%' : '25%'}
                    </div>
                    <div className="text-xs opacity-80">Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration Warning Section */}
      {!isLoading && (!plaidStatus.connected || !openaiStatus.connected) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <Settings className="h-6 w-6 text-amber-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">API Configuration Required</h3>
              <div className="space-y-3">
                {/* Plaid API status */}
                {!plaidStatus.connected && (
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-amber-700">Plaid API Not Connected</p>
                      <p className="text-sm text-amber-600">{plaidStatus.message}</p>
                    </div>
                  </div>
                )}
                {/* OpenAI API status */}
                {!openaiStatus.connected && (
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-amber-700">OpenAI API Not Connected</p>
                      <p className="text-sm text-amber-600">{openaiStatus.message}</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Setup instructions */}
              <div className="mt-4 text-sm text-amber-700 bg-amber-100 rounded-lg p-3">
                <strong>📖 Setup Guide:</strong> See <code>SETUP.md</code> for complete API configuration instructions.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary Dashboard */}
      <div className="animate-slide-up">
        <FinancialSummary />
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8" style={{ animationDelay: '200ms' }}>
        
        {/* Left Column: Bank Connections */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Bank Connections</span>
            </h3>
            {/* Plaid Link button for connecting bank accounts */}
            <PlaidLinkButton />
            {/* Display connected institutions */}
            <div className="mt-6">
              <ConnectedInstitutions />
            </div>
          </div>
        </div>

        {/* Center Column: Financial Goals */}
        <div className="xl:col-span-2 space-y-6">
          <GoalManager showAddGoal={true} />
        </div>

        {/* Right Column: AI Insights */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Insights</span>
            </h3>
            
            {/* Conditional rendering based on API status and data availability */}
            {!openaiStatus.connected ? (
              // OpenAI not configured
              <div className="text-center py-6">
                <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-3">
                  Configure OpenAI API to enable AI insights
                </p>
                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                  Add your OPENAI_API_KEY to .env.local
                </div>
              </div>
            ) : transactions.length === 0 ? (
              // No transaction data available
              <div className="text-center py-6">
                <Brain className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-3">
                  Connect bank accounts to generate AI insights
                </p>
              </div>
            ) : (
              // AI insights interface
              <div className="space-y-4">
                {/* Generate insights button */}
                <button 
                  onClick={handleGenerateInsights}
                  disabled={isGeneratingInsights}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isGeneratingInsights ? (
                    // Loading state
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    // Default state
                    <>
                      <Brain className="h-4 w-4" />
                      <span>Generate Insights</span>
                    </>
                  )}
                </button>
                
                {/* Display generated insights */}
                {insights.length > 0 ? (
                  <div className="space-y-3">
                    {insights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="p-3 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-900 text-sm">{insight.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{insight.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          {/* Priority indicator */}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {insight.priority} priority
                          </span>
                          {/* Confidence score */}
                          <span className="text-xs text-slate-500">{insight.confidence_score}% confident</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // No insights generated yet
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-600">No insights generated yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 