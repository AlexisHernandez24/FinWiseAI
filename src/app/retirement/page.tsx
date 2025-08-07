'use client'

import { Target, TrendingUp, DollarSign, BarChart3, PieChart, Settings, AlertCircle, Calendar, Calculator, Brain } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { useApiStatus } from '@/hooks/useApiStatus'

export default function RetirementPage() {
  const { accounts, goals, portfolio, getMonthlyIncome } = useFinancialStore()
  const [retirementAge, setRetirementAge] = useState(65)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  
  const { plaid: plaidStatus } = useApiStatus()
  const monthlyIncome = getMonthlyIncome()
  
  // Filter retirement-related goals
  const retirementGoals = goals.filter(goal => 
    goal.type === 'retirement' || 
    goal.title.toLowerCase().includes('retirement') ||
    goal.title.toLowerCase().includes('401k') ||
    goal.title.toLowerCase().includes('ira')
  )
  
  // Calculate retirement accounts value
  const retirementAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes('401k') ||
    acc.name.toLowerCase().includes('ira') ||
    acc.name.toLowerCase().includes('retirement')
  )
  
  const currentRetirementSavings = retirementAccounts.reduce((sum, acc) => 
    sum + (acc.balances.current || 0), 0
  )
  
  const hasRetirementData = retirementGoals.length > 0 || currentRetirementSavings > 0

  // Calculate projected values based on real data
  const calculateProjection = () => {
    if (!hasRetirementData && monthlyIncome === 0) return []
    
    const currentAge = 35 // This could be from user profile
    const yearsToRetirement = retirementAge - currentAge
    const annualReturn = 0.07 // 7% average return
    const currentBalance = currentRetirementSavings
    const monthlyContrib = monthlyContribution
    
    const projectionData = []
    
    for (let year = 0; year <= yearsToRetirement; year += 5) {
      const futureValue = currentBalance * Math.pow(1 + annualReturn, year) +
        monthlyContrib * 12 * (Math.pow(1 + annualReturn, year) - 1) / annualReturn
      
      projectionData.push({
        age: currentAge + year,
        balance: Math.round(futureValue),
        goal: Math.round(monthlyIncome * 12 * 25) // 25x annual income rule
      })
    }
    
    return projectionData
  }

  const projectionData = calculateProjection()
  const finalProjection = projectionData[projectionData.length - 1]
  
  // Calculate retirement readiness percentage
  const retirementReadiness = finalProjection && finalProjection.goal > 0 
    ? Math.min((finalProjection.balance / finalProjection.goal) * 100, 100)
    : 0

  if (!hasRetirementData && monthlyIncome === 0) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 rounded-2xl"></div>
          <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-8 w-8 text-white" />
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <Brain className="h-4 w-4" />
                <span>Retirement Planning & Analysis</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Retirement Planning
            </h1>
            <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
              Connect your accounts and set retirement goals to start planning for your future.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200/50 text-center">
          <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Retirement Data Available</h3>
          <p className="text-slate-600 mb-6">
            {!plaidStatus.connected 
              ? "Configure your Plaid API to connect retirement accounts and start planning."
              : "Connect your retirement accounts and set goals to begin retirement planning."
            }
          </p>
          {!plaidStatus.connected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 font-medium">API Setup Required</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Add your Plaid API keys to .env.local to enable retirement planning.
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
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        <div className="relative p-8 lg:p-12 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-white" />
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <Brain className="h-4 w-4" />
                  <span>Retirement Planning & Analysis</span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  Retirement Planning
                </h1>
                <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                  {currentRetirementSavings > 0 
                    ? `You have $${currentRetirementSavings.toLocaleString()} saved for retirement and are ${retirementReadiness.toFixed(0)}% on track.`
                    : "Start planning your retirement with goal-based savings strategies."
                  }
                </p>
              </div>
              <div className="flex items-center space-x-6 text-white/80 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span>{retirementAccounts.length} retirement accounts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-orange-400" />
                  <span>{retirementAge - 35} years to retirement</span>
                </div>
              </div>
            </div>
            
            {/* Retirement Readiness Circle */}
            <div className="hidden lg:block">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray={`${retirementReadiness}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Math.round(retirementReadiness)}%</p>
                    <p className="text-xs">Ready</p>
                  </div>
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
            label: 'Current Savings', 
            value: `$${currentRetirementSavings.toLocaleString()}`, 
            change: retirementAccounts.length > 0 ? `${retirementAccounts.length} accounts` : 'No accounts yet', 
            positive: true, 
            icon: DollarSign 
          },
          { 
            label: 'Retirement Readiness', 
            value: `${retirementReadiness.toFixed(0)}%`, 
            change: retirementReadiness >= 80 ? 'On track' : retirementReadiness >= 50 ? 'Making progress' : 'Needs attention', 
            positive: retirementReadiness >= 50, 
            icon: Target 
          },
          { 
            label: 'Years to Retirement', 
            value: (retirementAge - 35).toString(), 
            change: `Retire at ${retirementAge}`, 
            positive: true, 
            icon: Calendar 
          },
          { 
            label: 'Monthly Contribution', 
            value: `$${monthlyContribution.toLocaleString()}`, 
            change: monthlyIncome > 0 ? `${((monthlyContribution / monthlyIncome) * 100).toFixed(1)}% of income` : 'Set contribution', 
            positive: monthlyContribution > 0, 
            icon: TrendingUp 
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${stat.positive ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
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
        
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Retirement Projection */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Retirement Projection</h3>
            {projectionData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="age" stroke="#64748b" fontSize={12} />
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
                    <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#balanceGradient)" />
                    <Line type="monotone" dataKey="goal" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0.1} fill="url(#goalGradient)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No projection data available</p>
                  <p className="text-sm">Set up retirement goals to see projections</p>
                </div>
              </div>
            )}
          </div>

          {/* Retirement Goals Progress */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Retirement Goals Progress</h3>
            {retirementGoals.length > 0 ? (
              <div className="space-y-6">
                {retirementGoals.map((goal, index) => {
                  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
                  const isOnTrack = progress >= 50
                  
                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-slate-900">{goal.title}</h4>
                          <p className="text-sm text-slate-600">
                            ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                          </p>
                        </div>
                        <div className={`flex items-center space-x-2 text-xs px-3 py-1 rounded-full ${
                          isOnTrack ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <span>{progress.toFixed(1)}% complete</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isOnTrack ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                        <span>Priority: {goal.priority}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">No retirement goals set</p>
                <p className="text-sm text-slate-500">Create retirement goals to track your progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          
          {/* Quick Calculator */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Calculator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Retirement Age</label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min="50"
                  max="80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Contribution</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min="0"
                  step="50"
                />
              </div>
              {finalProjection && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Projected at {retirementAge}:</strong><br/>
                    ${finalProjection.balance.toLocaleString()}
                  </p>
                </div>
              )}
              <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">Calculate Plan</span>
              </button>
            </div>
          </div>

          {/* Retirement Accounts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Retirement Accounts</h3>
            {retirementAccounts.length > 0 ? (
              <div className="space-y-3">
                {retirementAccounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-600">{account.subtype}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        ${(account.balances.current || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{account.mask}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <PieChart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">No retirement accounts</p>
              </div>
            )}
          </div>

          {/* Retirement Tips */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Retirement Tips</h3>
            <div className="space-y-4">
              {[
                {
                  icon: '🎯',
                  title: 'Set Clear Goals',
                  description: 'Define your retirement lifestyle and calculate the required savings.'
                },
                {
                  icon: '⚡',
                  title: 'Start Early',
                  description: 'The power of compound interest works best with time on your side.'
                },
                {
                  icon: '📈',
                  title: 'Maximize Contributions',
                  description: 'Take advantage of employer matching and contribution limits.'
                },
                {
                  icon: '🔄',
                  title: 'Diversify Investments',
                  description: 'Spread risk across different asset classes and sectors.'
                }
              ].map((tip, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="text-lg">{tip.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tip.title}</p>
                    <p className="text-xs text-slate-600">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 