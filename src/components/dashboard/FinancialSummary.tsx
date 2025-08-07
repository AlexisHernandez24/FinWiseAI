/**
 * FinancialSummary Component - Dashboard overview of key financial metrics
 * Displays net worth, income, expenses, and savings rate with visual indicators
 */

'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Target, AlertCircle } from 'lucide-react'
import { useFinancialStore } from '@/store/financialStore'
import { plaidService } from '@/lib/plaid'
import { useApiStatus } from '@/hooks/useApiStatus'

interface SummaryCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

// Individual metric card with trend indicator
function SummaryCard({ title, value, change, changeType, icon: Icon }: SummaryCardProps) {
  const changeColor = {
    positive: 'text-emerald-600',
    negative: 'text-red-500',
    neutral: 'text-slate-600'
  }[changeType]

  const changeBgColor = {
    positive: 'bg-emerald-50',
    negative: 'bg-red-50',
    neutral: 'bg-slate-50'
  }[changeType]

  const ChangeIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : null

  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 card-hover overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/30 rounded-2xl"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 leading-tight">{value}</p>
          </div>
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        
        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${changeBgColor}`}>
          {ChangeIcon && <ChangeIcon className={`h-4 w-4 ${changeColor}`} />}
          <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
        </div>
      </div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
        <div className="w-full h-full bg-gradient-to-tl from-blue-500 to-transparent rounded-tl-full"></div>
      </div>
    </div>
  )
}

// Empty state when no financial data is available
function EmptyStateCard() {
  const { plaid: plaidStatus } = useApiStatus()

  return (
    <div className="col-span-full bg-white rounded-2xl p-12 shadow-lg border border-slate-200/50 text-center">
      <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Financial Data Available</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        {!plaidStatus.connected 
          ? "Configure your Plaid API keys to connect bank accounts and view your financial summary."
          : "Connect your bank accounts to start tracking your financial metrics."
        }
      </p>
      {!plaidStatus.connected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700">
            <strong>Need API Setup?</strong> Check the SETUP.md file for instructions on configuring Plaid and OpenAI APIs.
          </p>
        </div>
      )}
    </div>
  )
}

export function FinancialSummary() {
  const { 
    accounts, 
    transactions, 
    portfolio, 
    getNetWorth, 
    getMonthlyIncome, 
    getMonthlyExpenses, 
    getSavingsRate 
  } = useFinancialStore()

  // Check if we have any financial data
  const hasData = accounts.length > 0 || transactions.length > 0

  if (!hasData) {
    return <EmptyStateCard />
  }

  // Calculate financial metrics from real data
  const netWorth = getNetWorth()
  const monthlyIncome = getMonthlyIncome()
  const monthlyExpenses = getMonthlyExpenses()
  const savingsRate = getSavingsRate()
  const portfolioValue = portfolio?.total_value || 0
  
  // Calculate emergency fund (assuming 6 months of expenses as target)
  const emergencyFundTarget = monthlyExpenses * 6
  const cashAccounts = accounts.filter(acc => acc.type === 'depository')
  const totalCash = cashAccounts.reduce((sum, acc) => sum + (acc.balances.current || 0), 0)
  const emergencyFundMonths = monthlyExpenses > 0 ? totalCash / monthlyExpenses : 0

  const summaryData = [
    {
      title: 'Total Net Worth',
      value: `$${netWorth.toLocaleString()}`,
      change: netWorth > 0 ? '+$0 this month' : 'Connect accounts for tracking',
      changeType: 'neutral' as const,
      icon: DollarSign
    },
    {
      title: 'Monthly Income',
      value: `$${monthlyIncome.toLocaleString()}`,
      change: monthlyIncome > 0 ? 'From connected accounts' : 'No income data yet',
      changeType: monthlyIncome > 0 ? ('positive' as const) : ('neutral' as const),
      icon: TrendingUp
    },
    {
      title: 'Monthly Expenses',
      value: `$${monthlyExpenses.toLocaleString()}`,
      change: monthlyExpenses > 0 ? 'From transactions' : 'No expense data yet',
      changeType: monthlyExpenses > 0 ? ('negative' as const) : ('neutral' as const),
      icon: CreditCard
    },
    {
      title: 'Investment Portfolio',
      value: `$${portfolioValue.toLocaleString()}`,
      change: portfolioValue > 0 ? `${portfolio?.total_gain_loss_percentage?.toFixed(1) || '0'}% return` : 'No investments connected',
      changeType: (portfolio?.total_gain_loss_percentage || 0) >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      change: savingsRate > 20 ? 'Excellent saving!' : savingsRate > 10 ? 'Good progress' : 'Room for improvement',
      changeType: savingsRate > 20 ? ('positive' as const) : savingsRate > 10 ? ('neutral' as const) : ('negative' as const),
      icon: Target
    },
    {
      title: 'Emergency Fund',
      value: `$${totalCash.toLocaleString()}`,
      change: `${emergencyFundMonths.toFixed(1)} months coverage`,
      changeType: emergencyFundMonths >= 6 ? ('positive' as const) : emergencyFundMonths >= 3 ? ('neutral' as const) : ('negative' as const),
      icon: PiggyBank
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {summaryData.map((item, index) => (
        <div
          key={index}
          className="animate-scale-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <SummaryCard
            title={item.title}
            value={item.value}
            change={item.change}
            changeType={item.changeType}
            icon={item.icon}
          />
        </div>
      ))}
    </div>
  )
} 