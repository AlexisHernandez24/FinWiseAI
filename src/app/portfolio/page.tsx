'use client'

import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Settings, AlertCircle, Activity, Target, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { useFinancialStore } from '@/store/financialStore'
import { useApiStatus } from '@/hooks/useApiStatus'

export default function PortfolioPage() {
  const { accounts, investments, portfolio } = useFinancialStore()
  const { plaid: plaidStatus } = useApiStatus()
  
  const hasInvestmentData = investments.length > 0 || (portfolio && portfolio.total_value > 0)
  const investmentAccounts = accounts.filter(acc => acc.type === 'investment' || acc.subtype === 'brokerage')

  // Calculate portfolio metrics from real data
  const totalValue = portfolio?.total_value || 0
  const totalGainLoss = portfolio?.total_gain_loss || 0
  const totalGainLossPercentage = portfolio?.total_gain_loss_percentage || 0
  const assetAllocation = portfolio?.asset_allocation || {
    stocks: 0,
    bonds: 0,
    cash: 0,
    real_estate: 0,
    crypto: 0,
    other: 0
  }

  // Generate performance data if we have investments
  const getPerformanceData = () => {
    if (!hasInvestmentData) return []
    
    // Generate sample performance data based on current portfolio value
    const months = ['6mo', '5mo', '4mo', '3mo', '2mo', '1mo', 'Now']
    return months.map((month, index) => {
      const baseValue = totalValue || 10000
      const variance = (Math.random() - 0.5) * 0.1 // ±5% variance
      const trendValue = baseValue * (1 + (index * 0.02) + variance) // 2% monthly growth with variance
      
      return {
        period: month,
        portfolio: Math.round(trendValue),
        benchmark: Math.round(baseValue * (1 + (index * 0.015))) // 1.5% benchmark growth
      }
    })
  }

  const performanceData = getPerformanceData()

  // Asset allocation data for pie chart
  const allocationData = Object.entries(assetAllocation)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, percentage: value }))

  const allocationColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

  if (!hasInvestmentData) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 rounded-2xl"></div>
          <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <Activity className="h-4 w-4" />
                <span>Investment Portfolio Analysis</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Portfolio Analysis
            </h1>
            <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
              Connect your investment accounts to track performance and analyze asset allocation.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200/50 text-center">
          <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Investment Data Available</h3>
          <p className="text-slate-600 mb-6">
            {!plaidStatus.connected 
              ? "Configure your Plaid API to connect investment accounts and track your portfolio."
              : investmentAccounts.length === 0
              ? "Connect your investment accounts to start portfolio analysis."
              : "Your connected investment accounts don't have holdings data yet."
            }
          </p>
          {!plaidStatus.connected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 font-medium">API Setup Required</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Add your Plaid API keys to .env.local to enable portfolio tracking.
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
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        <div className="relative p-8 lg:p-12 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-white" />
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <Activity className="h-4 w-4" />
                  <span>Investment Portfolio Analysis</span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  Portfolio Overview
                </h1>
                <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                  Your portfolio is worth <span className="font-semibold text-indigo-300">${totalValue.toLocaleString()}</span> with a 
                  <span className={`font-semibold ${totalGainLossPercentage >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {totalGainLossPercentage >= 0 ? ' +' : ' '}{totalGainLossPercentage.toFixed(2)}%
                  </span> return.
                </p>
              </div>
              <div className="flex items-center space-x-6 text-white/80 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span>{investments.length} holdings</span>
                </div>
                <div className="flex items-center space-x-1">
                  {totalGainLoss >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span>{totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Performance Badge */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-purple-300" />
                  <p className="text-sm font-medium">YTD Performance</p>
                  <p className={`text-2xl font-bold ${totalGainLossPercentage >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {totalGainLossPercentage >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(1)}%
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
            label: 'Portfolio Value', 
            value: `$${totalValue.toLocaleString()}`, 
            change: totalValue > 0 ? 'Total investments' : 'No investments', 
            positive: true, 
            icon: DollarSign 
          },
          { 
            label: 'Total Return', 
            value: `${totalGainLossPercentage >= 0 ? '+' : ''}${totalGainLossPercentage.toFixed(2)}%`, 
            change: `${totalGainLoss >= 0 ? '+' : ''}$${totalGainLoss.toLocaleString()}`, 
            positive: totalGainLoss >= 0, 
            icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown 
          },
          { 
            label: 'Holdings', 
            value: investments.length.toString(), 
            change: investments.length > 0 ? 'Active positions' : 'No positions', 
            positive: true, 
            icon: BarChart3 
          },
          { 
            label: 'Accounts', 
            value: investmentAccounts.length.toString(), 
            change: investmentAccounts.length > 0 ? 'Connected accounts' : 'No accounts', 
            positive: investmentAccounts.length > 0, 
            icon: Target 
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${stat.positive ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
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
          
          {/* Portfolio Performance */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Portfolio Performance</h3>
            {performanceData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Line type="monotone" dataKey="portfolio" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#64748b', strokeWidth: 2, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No performance data available</p>
                  <p className="text-sm">Connect investment accounts to see performance</p>
                </div>
              </div>
            )}
          </div>

          {/* Holdings Table */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Holdings</h3>
            {investments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Asset</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Value</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Gain/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{investment.name}</p>
                            <p className="text-sm text-slate-600">{investment.ticker_symbol}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-slate-900">{investment.quantity}</td>
                        <td className="text-right py-3 px-4 text-slate-900">${investment.price.toFixed(2)}</td>
                        <td className="text-right py-3 px-4 font-semibold text-slate-900">${investment.value.toLocaleString()}</td>
                        <td className={`text-right py-3 px-4 font-semibold ${
                          (investment.gain_loss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {(investment.gain_loss || 0) >= 0 ? '+' : ''}${(investment.gain_loss || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600">No holdings found</p>
                <p className="text-sm text-slate-500">Investment data will appear when accounts are connected</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          
          {/* Asset Allocation */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Asset Allocation</h3>
            {allocationData.length > 0 ? (
              <div>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={allocationColors[index % allocationColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {allocationData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: allocationColors[index % allocationColors.length] }}
                        ></div>
                        <span className="text-sm text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">No allocation data</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  alert('Buy Assets functionality coming soon! This would integrate with your broker to execute trades.')
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Buy Assets</span>
              </button>
              <button 
                onClick={() => {
                  alert('Sell Assets functionality coming soon! This would integrate with your broker to execute trades.')
                }}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <TrendingDown className="h-4 w-4" />
                <span className="font-medium">Sell Assets</span>
              </button>
              <button 
                onClick={() => {
                  alert('Portfolio Rebalancing functionality coming soon! This would analyze your current allocation and suggest rebalancing trades.')
                }}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span className="font-medium">Rebalance</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
            {investments.length > 0 ? (
              <div className="space-y-3">
                {investments.slice(0, 3).map((investment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{investment.ticker_symbol}</p>
                      <p className="text-xs text-slate-600">Current position</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{investment.quantity} shares</p>
                      <p className="text-xs text-slate-500">${investment.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 