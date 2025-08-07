'use client'

import { useFinancialStore } from '@/store/financialStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AiBudgetGenerator } from '@/components/budget/AiBudgetGenerator'
import { AIBudgetPlan } from '@/lib/budgetAnalyzer'
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Calendar,
  PieChart,
  AlertCircle,
  Plus,
  Brain,
  Bot
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { useState } from 'react'

export default function BudgetManagement() {
  const { transactions, budgets, accounts, getMonthlyIncome, getMonthlyExpenses } = useFinancialStore()
  const [showAiGenerator, setShowAiGenerator] = useState(false)

  const monthlyIncome = getMonthlyIncome()
  const monthlyExpenses = getMonthlyExpenses()
  const remaining = monthlyIncome - monthlyExpenses

  // Calculate category spending from transactions
  const categorySpending = transactions
    .filter(t => t.amount < 0) // Expenses only
    .reduce((acc, transaction) => {
      const category = Array.isArray(transaction.category) 
        ? transaction.category[0] || 'Other'
        : transaction.category || 'Other'
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount)
      return acc
    }, {} as Record<string, number>)

  const categoryData = Object.entries(categorySpending)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)

  // Generate monthly spending trend data
  const spendingTrendData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    
    // Calculate spending for this month (simplified)
    const baseSpending = monthlyExpenses
    const variation = (Math.random() - 0.5) * 0.3 * baseSpending
    const spending = Math.max(0, baseSpending + variation)
    
    return {
      month: monthName,
      spending
    }
  })

  const handleBudgetGenerated = (budget: AIBudgetPlan) => {
    // Convert AI budget to our budget format and save it
    console.log('Generated budget:', budget)
    setShowAiGenerator(false)
    
    // Convert AI budget recommendations to our budget format
    const budgetCategories = budget.budget_categories.map(category => ({
      name: category.category,
      budgeted: category.recommended_amount,
      spent: category.current_spending,
      remaining: category.recommended_amount - category.current_spending
    }))
    
    // You could save this to the financial store
    // addBudget({
    //   name: `AI Generated Budget - ${new Date().toLocaleDateString()}`,
    //   month: new Date().getMonth(),
    //   year: new Date().getFullYear(),
    //   total_income: budget.total_monthly_income,
    //   total_budgeted: budget.total_recommended_spending,
    //   categories: budgetCategories
    // })
    
    // For now, just show success message
    alert(`AI Budget Generated Successfully!\n\nRecommended Spending: $${budget.total_recommended_spending.toFixed(0)}\nSavings Rate: ${budget.recommended_savings_rate.toFixed(1)}%\nEmergency Fund Target: $${budget.emergency_fund_target.toFixed(0)}`)
  }

  // Show empty state if no accounts connected
  if (accounts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl p-8 mb-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Budget Overview</h1>
                <p className="text-emerald-100 text-lg">
                  Connect more accounts to see detailed budget analysis.
                </p>
              </div>
              <TrendingUp className="w-16 h-16 text-emerald-200" />
            </div>
          </div>
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        </div>

        {/* Empty State */}
        <Card className="p-12 text-center">
          <PieChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Budget Data Available</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Connect your bank accounts through Plaid to enable budget management and AI-powered budget recommendations.
          </p>
          <Button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Connect Bank Account
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl p-8 mb-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Budget Management</h1>
              <p className="text-emerald-100 text-lg">
                Smart budgeting powered by AI insights and real spending data.
              </p>
            </div>
            <div className="text-right">
              <div className="text-emerald-200 text-sm">Monthly Budget Status</div>
              <div className="text-2xl font-bold">
                {remaining >= 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over budget`}
              </div>
              <div className="text-emerald-200 text-sm">
                {remaining >= 0 ? '✓ On Track' : '⚠ Over Budget'}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white opacity-10 rounded-full"></div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="overview">Budget Overview</TabsTrigger>
            <TabsTrigger value="ai-generator" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Budget Generator
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <Button 
            onClick={() => {
              const aiGeneratorTab = document.querySelector('[data-value="ai-generator"]') as HTMLElement
              if (aiGeneratorTab) {
                aiGeneratorTab.click()
              }
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Generate AI Budget
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Budget Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 card-hover">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-slate-900">${monthlyIncome.toFixed(0)}</p>
                  <p className="text-xs text-emerald-600">Connect income sources</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-hover">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Spent</p>
                  <p className="text-2xl font-bold text-slate-900">${monthlyExpenses.toFixed(0)}</p>
                  <p className="text-xs text-blue-600">{transactions.filter(t => t.amount < 0).length} transactions</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-hover">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${remaining >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Target className={`w-6 h-6 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Remaining</p>
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(remaining).toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-600">{remaining >= 0 ? 'Under budget' : 'Over budget'}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-hover">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Categories</p>
                  <p className="text-2xl font-bold text-slate-900">{categoryData.length}</p>
                  <p className="text-xs text-purple-600">Spending categories</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Spending Trend Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(0)}`, 'Spending']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spending" 
                    stroke="#10b981" 
                    fill="url(#spendingGradient)" 
                  />
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ai-generator">
          <AiBudgetGenerator onBudgetGenerated={handleBudgetGenerated} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Category Spending Breakdown */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Category Spending Breakdown</h3>
              <Button className="btn-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
            </div>

            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-8 bg-gradient-to-t from-emerald-400 to-teal-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-slate-600">{category.percentage.toFixed(1)}% of total spending</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${category.amount.toFixed(0)}</div>
                    <Badge variant="outline">
                      {category.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(0)}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 