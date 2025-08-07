'use client'

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, ArrowUpRight } from 'lucide-react'

const monthlyData = [
  { month: 'Jan', income: 12500, expenses: 6800, savings: 5700, investments: 4200 },
  { month: 'Feb', income: 12800, expenses: 6200, savings: 6600, investments: 4800 },
  { month: 'Mar', income: 13200, expenses: 6500, savings: 6700, investments: 5200 },
  { month: 'Apr', income: 12900, expenses: 6100, savings: 6800, investments: 5100 },
  { month: 'May', income: 13500, expenses: 6400, savings: 7100, investments: 5600 },
  { month: 'Jun', income: 12850, expenses: 6234, savings: 6616, investments: 5200 }
]

const categoryData = [
  { name: 'Housing', value: 2850, color: '#3b82f6' },
  { name: 'Food & Dining', value: 1240, color: '#10b981' },
  { name: 'Transportation', value: 680, color: '#f59e0b' },
  { name: 'Entertainment', value: 420, color: '#8b5cf6' },
  { name: 'Healthcare', value: 380, color: '#ef4444' },
  { name: 'Shopping', value: 664, color: '#06b6d4' }
]

const budgetData = [
  { category: 'Housing', spent: 2850, budget: 3000, percentage: 95 },
  { category: 'Food & Dining', spent: 1240, budget: 1500, percentage: 83 },
  { category: 'Transportation', spent: 680, budget: 800, percentage: 85 },
  { category: 'Entertainment', spent: 420, budget: 600, percentage: 70 },
  { category: 'Healthcare', spent: 380, budget: 500, percentage: 76 },
  { category: 'Shopping', spent: 664, budget: 700, percentage: 95 }
]

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Financial Flow Chart */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Financial Flow</h3>
            <p className="text-slate-600 mt-1">Income, expenses, and savings over time</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Expenses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Savings</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} 
              />
              <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#incomeGradient)" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#expenseGradient)" />
              <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#savingsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown and Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending by Category */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Spending Categories</h3>
              <p className="text-slate-600 mt-1">This month's breakdown</p>
            </div>
            <div className="flex items-center space-x-1 text-emerald-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">-3.2%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`$${value}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Budget Progress</h3>
              <p className="text-slate-600 mt-1">Monthly spending vs targets</p>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">On Track</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {budgetData.map((item, index) => {
              const isOverBudget = item.percentage > 100
              const isNearLimit = item.percentage > 90
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">{item.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-slate-900'}`}>
                        ${item.spent} / ${item.budget}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isOverBudget ? 'bg-red-100 text-red-700' : 
                        isNearLimit ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : 
                        isNearLimit ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200/50">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Financial Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">You're saving 15% more than similar earners</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">On track to reach retirement goal 3 years early</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-slate-700">Consider increasing investment allocation by 5%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Spending efficiency improved by 12% this quarter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 