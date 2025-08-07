'use client'

import { LineChart, Zap, TrendingUp, DollarSign, Target, Settings, AlertCircle, Calculator, Brain, Lightbulb } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { useApiStatus } from '@/hooks/useApiStatus'

export default function ScenariosPage() {
  const { accounts, transactions, portfolio, goals, getNetWorth, getMonthlyIncome, getMonthlyExpenses } = useFinancialStore()
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [customScenario, setCustomScenario] = useState({
    name: '',
    incomeChange: 0,
    expenseChange: 0,
    investmentReturn: 7,
    timeframe: 10
  })

  const { plaid: plaidStatus, openai: openaiStatus } = useApiStatus()
  
  const hasFinancialData = accounts.length > 0 || transactions.length > 0
  const currentNetWorth = getNetWorth()
  const monthlyIncome = getMonthlyIncome()
  const monthlyExpenses = getMonthlyExpenses()

  // Generate scenario projections based on real data
  const generateProjection = (scenario: Omit<typeof customScenario, 'name'>) => {
    if (!hasFinancialData) return []
    
    const projectionData = []
    const baseNetWorth = currentNetWorth || 10000
    const adjustedIncome = monthlyIncome * (1 + scenario.incomeChange / 100)
    const adjustedExpenses = monthlyExpenses * (1 + scenario.expenseChange / 100)
    const monthlySavings = Math.max(0, adjustedIncome - adjustedExpenses)
    const annualReturn = scenario.investmentReturn / 100
    
    for (let year = 0; year <= scenario.timeframe; year++) {
      const investmentGrowth = baseNetWorth * Math.pow(1 + annualReturn, year)
      const savingsAccumulation = monthlySavings * 12 * year
      const totalNetWorth = investmentGrowth + savingsAccumulation
      
      projectionData.push({
        year: new Date().getFullYear() + year,
        baseline: baseNetWorth * Math.pow(1.05, year), // 5% baseline growth
        scenario: Math.round(totalNetWorth)
      })
    }
    
    return projectionData
  }

  // Pre-built scenarios based on real financial data
  const getScenarios = () => {
    if (!hasFinancialData) return []
    
    return [
      {
        id: 'income_increase',
        name: 'Career Growth',
        description: '20% income increase with promotion',
        icon: '📈',
        impact: 'high',
        params: { incomeChange: 20, expenseChange: 5, investmentReturn: 7, timeframe: 10 }
      },
      {
        id: 'expense_reduction',
        name: 'Expense Optimization',
        description: 'Reduce monthly expenses by 15%',
        icon: '💰',
        impact: 'medium',
        params: { incomeChange: 0, expenseChange: -15, investmentReturn: 7, timeframe: 10 }
      },
      {
        id: 'investment_boost',
        name: 'Aggressive Investing',
        description: 'Higher risk investments (10% return)',
        icon: '🚀',
        impact: 'high',
        params: { incomeChange: 0, expenseChange: 0, investmentReturn: 10, timeframe: 10 }
      },
      {
        id: 'emergency_fund',
        name: 'Emergency Scenario',
        description: '50% income reduction for 2 years',
        icon: '⚠️',
        impact: 'negative',
        params: { incomeChange: -50, expenseChange: -20, investmentReturn: 5, timeframe: 10 }
      },
      {
        id: 'early_retirement',
        name: 'Early Retirement',
        description: 'Retire 10 years early with savings',
        icon: '🏖️',
        impact: 'neutral',
        params: { incomeChange: -100, expenseChange: -30, investmentReturn: 6, timeframe: 25 }
      }
    ]
  }

  const scenarios = getScenarios()
  const projectionData = selectedScenario 
    ? generateProjection(scenarios.find(s => s.id === selectedScenario)?.params || customScenario)
    : generateProjection(customScenario)

  const finalProjection = projectionData[projectionData.length - 1]
  const projectedGrowth = finalProjection && currentNetWorth > 0 
    ? ((finalProjection.scenario - currentNetWorth) / currentNetWorth) * 100 
    : 0

  if (!hasFinancialData) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl"></div>
          <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-8 w-8 text-white" />
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <Brain className="h-4 w-4" />
                <span>Financial Scenario Planning</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Financial Scenarios
            </h1>
            <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
              Connect your accounts to explore different financial scenarios and their long-term impact.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200/50 text-center">
          <Zap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Financial Data Available</h3>
          <p className="text-slate-600 mb-6">
            {!plaidStatus.connected 
              ? "Configure your Plaid API to connect accounts and start scenario planning."
              : "Connect your financial accounts to explore different scenarios and their impact."
            }
          </p>
          {!plaidStatus.connected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 font-medium">API Setup Required</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Add your Plaid API keys to .env.local to enable scenario planning.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        <div className="relative p-8 lg:p-12 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-white" />
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <Brain className="h-4 w-4" />
                  <span>Financial Scenario Planning</span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  Scenario Analysis
                </h1>
                <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                  {finalProjection 
                    ? `Current scenario projects ${projectedGrowth >= 0 ? '+' : ''}${projectedGrowth.toFixed(1)}% growth over ${customScenario.timeframe} years.`
                    : "Explore different financial scenarios and their long-term impact on your wealth."
                  }
                </p>
              </div>
              <div className="flex items-center space-x-6 text-white/80 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Net Worth: ${currentNetWorth.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calculator className="h-4 w-4 text-indigo-400" />
                  <span>{customScenario.timeframe} year projection</span>
                </div>
              </div>
            </div>
            
            {/* Scenario Impact Badge */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-center">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <p className="text-sm font-medium">Projected Impact</p>
                  <p className={`text-2xl font-bold ${projectedGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {projectedGrowth >= 0 ? '+' : ''}{projectedGrowth.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Current Net Worth', 
            value: `$${currentNetWorth.toLocaleString()}`, 
            change: 'Starting point', 
            positive: true, 
            icon: DollarSign 
          },
          { 
            label: 'Monthly Income', 
            value: `$${monthlyIncome.toLocaleString()}`, 
            change: monthlyIncome > 0 ? 'Active income' : 'No income data', 
            positive: monthlyIncome > 0, 
            icon: TrendingUp 
          },
          { 
            label: 'Monthly Expenses', 
            value: `$${monthlyExpenses.toLocaleString()}`, 
            change: monthlyExpenses > 0 ? 'Current spending' : 'No expense data', 
            positive: false, 
            icon: Target 
          },
          { 
            label: 'Projected Growth', 
            value: `${projectedGrowth >= 0 ? '+' : ''}${projectedGrowth.toFixed(1)}%`, 
            change: `Over ${customScenario.timeframe} years`, 
            positive: projectedGrowth >= 0, 
            icon: projectedGrowth >= 0 ? TrendingUp : AlertCircle 
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${stat.positive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Projection Chart */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Net Worth Projection */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Net Worth Projection</h3>
            {projectionData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#94a3b8', strokeWidth: 2, r: 3 }} />
                    <Line type="monotone" dataKey="scenario" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No projection data available</p>
                  <p className="text-sm">Configure scenario parameters to see projections</p>
                </div>
              </div>
            )}
          </div>

          {/* Pre-built Scenarios */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Pre-built Scenarios</h3>
            {scenarios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <div 
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id === selectedScenario ? null : scenario.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedScenario === scenario.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{scenario.icon}</div>
                      <h4 className="font-semibold text-slate-900 mb-1">{scenario.name}</h4>
                      <p className="text-xs text-slate-600 mb-3">{scenario.description}</p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        scenario.impact === 'high' ? 'bg-green-100 text-green-700' :
                        scenario.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        scenario.impact === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {scenario.impact} impact
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">No scenarios available</p>
                <p className="text-sm text-slate-500">Connect accounts to generate scenarios</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          
          {/* Custom Scenario Builder */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Custom Scenario Builder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Scenario Name</label>
                <input
                  type="text"
                  value={customScenario.name}
                  onChange={(e) => setCustomScenario(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Scenario"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Income Change: {customScenario.incomeChange >= 0 ? '+' : ''}{customScenario.incomeChange}%
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={customScenario.incomeChange}
                  onChange={(e) => setCustomScenario(prev => ({ ...prev, incomeChange: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expense Change: {customScenario.expenseChange >= 0 ? '+' : ''}{customScenario.expenseChange}%
                </label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={customScenario.expenseChange}
                  onChange={(e) => setCustomScenario(prev => ({ ...prev, expenseChange: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Investment Return: {customScenario.investmentReturn}%
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={customScenario.investmentReturn}
                  onChange={(e) => setCustomScenario(prev => ({ ...prev, investmentReturn: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Timeframe: {customScenario.timeframe} years
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={customScenario.timeframe}
                  onChange={(e) => setCustomScenario(prev => ({ ...prev, timeframe: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <button 
                onClick={() => setSelectedScenario(null)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Calculator className="h-4 w-4" />
                <span className="font-medium">Update Projection</span>
              </button>
            </div>
          </div>

          {/* AI Impact Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">AI Impact Analysis</h3>
            {!openaiStatus.connected ? (
              <div className="text-center py-6">
                <Brain className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600 mb-3">AI analysis unavailable</p>
                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                  Configure OpenAI API for scenario insights
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Scenario Recommendation</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Based on your current financial situation, the "Career Growth" scenario offers the best risk-adjusted returns.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Risk Assessment</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Consider building a larger emergency fund before pursuing aggressive investment strategies.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={async () => {
                    try {
                      // Get current financial context
                      const financialContext = {
                        accounts: accounts.length,
                        transactions: transactions.length,
                        netWorth: getNetWorth(),
                        monthlyIncome: getMonthlyIncome(),
                        monthlyExpenses: getMonthlyExpenses(),
                        goals: goals.length,
                        portfolioValue: portfolio?.total_value || 0,
                        currentScenario: selectedScenario || 'None'
                      }

                      const response = await fetch('/api/ai/chat', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          message: `Analyze the financial impact of the "${selectedScenario || 'current'}" scenario. Consider my current financial situation and provide specific recommendations.`,
                          financialContext,
                          userId: 'user_001'
                        }),
                      })

                      const result = await response.json()
                      
                      if (result.success && result.response) {
                        alert(`AI Impact Analysis:\n\n${result.response}`)
                      } else {
                        alert('Failed to generate AI analysis. Please try again.')
                      }
                    } catch (error) {
                      console.error('Error getting AI analysis:', error)
                      alert('Error generating AI analysis. Please try again.')
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span className="font-medium">Get AI Analysis</span>
                </button>
              </div>
            )}
          </div>

          {/* Scenario Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Scenario Summary</h3>
            {finalProjection ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Starting Net Worth</span>
                  <span className="font-semibold">${currentNetWorth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Projected Net Worth</span>
                  <span className="font-semibold">${finalProjection.scenario.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Total Growth</span>
                    <span className={`font-bold ${projectedGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {projectedGrowth >= 0 ? '+' : ''}{projectedGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calculator className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">No scenario selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 