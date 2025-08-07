import { Transaction, FinancialGoal, BudgetCategory } from '@/types/financial'
import { openaiService } from './openai'

export interface SpendingAnalysis {
  total_monthly_spending: number
  category_breakdown: CategorySpending[]
  spending_trends: SpendingTrend[]
  irregular_expenses: IrregularExpense[]
  income_stability: IncomeStability
  savings_potential: number
  red_flags: string[]
  recommendations: string[]
}

export interface CategorySpending {
  category: string
  subcategory?: string
  monthly_average: number
  percentage_of_income: number
  trend: 'increasing' | 'decreasing' | 'stable'
  necessity_score: number // 1-10 (10 = essential, 1 = discretionary)
  optimization_potential: number // 0-100% potential savings
}

export interface SpendingTrend {
  period: string
  amount: number
  change_percentage: number
}

export interface IrregularExpense {
  description: string
  amount: number
  frequency: 'quarterly' | 'annually' | 'rare'
  predictable: boolean
}

export interface IncomeStability {
  regularity_score: number // 1-10
  average_monthly: number
  variation_coefficient: number
  primary_sources: string[]
}

export interface BudgetRecommendation {
  category: string
  subcategory?: string
  recommended_amount: number
  current_spending: number
  adjustment_percentage: number
  reasoning: string
  priority: 'high' | 'medium' | 'low'
  goal_alignment: string[]
}

export interface AIBudgetPlan {
  total_monthly_income: number
  total_recommended_spending: number
  recommended_savings_rate: number
  emergency_fund_target: number
  budget_categories: BudgetRecommendation[]
  goal_allocations: GoalAllocation[]
  implementation_timeline: string[]
  confidence_score: number
  personalized_tips: string[]
}

export interface GoalAllocation {
  goal_id: string
  goal_name: string
  monthly_allocation: number
  timeline_months: number
  priority_rank: number
}

class BudgetAnalyzerService {
  /**
   * Analyzes user's spending patterns from transaction data
   */
  async analyzeSpendingPatterns(
    transactions: Transaction[], 
    monthsToAnalyze: number = 6
  ): Promise<SpendingAnalysis> {
    if (transactions.length === 0) {
      throw new Error('No transaction data available for analysis')
    }

    // Filter transactions to the specified time period
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToAnalyze)
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= cutoffDate
    )

    // Categorize expenses
    const expenseTransactions = recentTransactions.filter(t => t.amount < 0)
    const incomeTransactions = recentTransactions.filter(t => t.amount > 0)

    // Calculate category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(expenseTransactions, monthsToAnalyze)
    
    // Analyze income stability
    const incomeStability = this.analyzeIncomeStability(incomeTransactions, monthsToAnalyze)
    
    // Calculate spending trends
    const spendingTrends = this.calculateSpendingTrends(expenseTransactions, monthsToAnalyze)
    
    // Identify irregular expenses
    const irregularExpenses = this.identifyIrregularExpenses(expenseTransactions)
    
    // Calculate total monthly spending
    const totalMonthlySpending = Math.abs(
      expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    ) / monthsToAnalyze

    // Calculate savings potential
    const savingsPotential = this.calculateSavingsPotential(categoryBreakdown, incomeStability.average_monthly)

    // Identify red flags
    const redFlags = this.identifyRedFlags(categoryBreakdown, incomeStability, totalMonthlySpending)

    // Generate recommendations
    const recommendations = this.generateRecommendations(categoryBreakdown, incomeStability)

    return {
      total_monthly_spending: totalMonthlySpending,
      category_breakdown: categoryBreakdown,
      spending_trends: spendingTrends,
      irregular_expenses: irregularExpenses,
      income_stability: incomeStability,
      savings_potential: savingsPotential,
      red_flags: redFlags,
      recommendations
    }
  }

  /**
   * Generates an AI-powered optimal budget based on spending analysis and goals
   */
  async generateOptimalBudget(
    spendingAnalysis: SpendingAnalysis,
    goals: FinancialGoal[],
    userPreferences?: {
      aggressiveness?: 'conservative' | 'moderate' | 'aggressive'
      priority_goals?: string[]
      fixed_expenses?: { category: string; amount: number }[]
    }
  ): Promise<AIBudgetPlan> {
    try {
      console.log('🔄 Generating AI budget via API...')
      const response = await fetch('/api/ai/generate-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spendingAnalysis,
          goals,
          userPreferences,
          userId: 'user_001' // This should come from user context
        }),
      })

      const result = await response.json()
      console.log('📡 AI budget API response:', result)

      if (result.success && result.budget) {
        console.log('✅ AI budget generated successfully')
        return result.budget
      } else {
        throw new Error(result.error || 'Failed to generate budget recommendations')
      }
    } catch (error) {
      console.error('❌ Budget generation failed:', error)
      throw new Error('Failed to generate optimal budget. Please try again.')
    }
  }

  private calculateCategoryBreakdown(
    expenseTransactions: Transaction[], 
    monthsToAnalyze: number
  ): CategorySpending[] {
    const categoryMap = new Map<string, {
      total: number
      count: number
      amounts: number[]
    }>()

    // Group transactions by category
    expenseTransactions.forEach(transaction => {
      const category = Array.isArray(transaction.category) ? transaction.category[0] || 'Other' : transaction.category || 'Other'
      const amount = Math.abs(transaction.amount)
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, count: 0, amounts: [] })
      }
      
      const categoryData = categoryMap.get(category)!
      categoryData.total += amount
      categoryData.count += 1
      categoryData.amounts.push(amount)
    })

    const totalSpending = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0)

    // Convert to CategorySpending format
    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const monthlyAverage = data.total / monthsToAnalyze
      const percentageOfSpending = (data.total / totalSpending) * 100
      
      // Calculate trend (simplified - in production would use more sophisticated analysis)
      const trend = this.calculateCategoryTrend(data.amounts)
      
      // Assign necessity score based on category
      const necessityScore = this.getNecessityScore(category)
      
      // Calculate optimization potential
      const optimizationPotential = this.getOptimizationPotential(category, necessityScore)

      return {
        category,
        monthly_average: monthlyAverage,
        percentage_of_income: percentageOfSpending,
        trend,
        necessity_score: necessityScore,
        optimization_potential: optimizationPotential
      }
    }).sort((a, b) => b.monthly_average - a.monthly_average)
  }

  private analyzeIncomeStability(
    incomeTransactions: Transaction[], 
    monthsToAnalyze: number
  ): IncomeStability {
    if (incomeTransactions.length === 0) {
      return {
        regularity_score: 1,
        average_monthly: 0,
        variation_coefficient: 0,
        primary_sources: []
      }
    }

    // Group income by month
    const monthlyIncomes: number[] = []
    const sources = new Set<string>()

    for (let i = 0; i < monthsToAnalyze; i++) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setDate(0)
      monthEnd.setHours(23, 59, 59, 999)

      const monthIncome = incomeTransactions
        .filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate >= monthStart && transactionDate <= monthEnd
        })
        .reduce((sum, t) => sum + t.amount, 0)

      monthlyIncomes.push(monthIncome)
      
      // Collect income sources
      incomeTransactions.forEach(t => {
        if (t.merchant_name) sources.add(t.merchant_name)
      })
    }

    const averageMonthly = monthlyIncomes.reduce((sum, income) => sum + income, 0) / monthsToAnalyze
    const variance = monthlyIncomes.reduce((sum, income) => sum + Math.pow(income - averageMonthly, 2), 0) / monthsToAnalyze
    const standardDeviation = Math.sqrt(variance)
    const variationCoefficient = averageMonthly > 0 ? standardDeviation / averageMonthly : 0

    // Calculate regularity score (1-10, where 10 is most regular)
    const regularityScore = Math.max(1, Math.min(10, 10 - (variationCoefficient * 10)))

    return {
      regularity_score: regularityScore,
      average_monthly: averageMonthly,
      variation_coefficient: variationCoefficient,
      primary_sources: Array.from(sources)
    }
  }

  private calculateSpendingTrends(
    expenseTransactions: Transaction[], 
    monthsToAnalyze: number
  ): SpendingTrend[] {
    const trends: SpendingTrend[] = []

    for (let i = 0; i < monthsToAnalyze; i++) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setDate(0)
      monthEnd.setHours(23, 59, 59, 999)

      const monthSpending = expenseTransactions
        .filter(t => {
          const transactionDate = new Date(t.date)
          return transactionDate >= monthStart && transactionDate <= monthEnd
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const period = monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      // Calculate change percentage (compared to previous month)
      const changePercentage = i < trends.length - 1 && trends[i - 1] ? 
        ((monthSpending - trends[i - 1].amount) / trends[i - 1].amount) * 100 : 0

      trends.unshift({
        period,
        amount: monthSpending,
        change_percentage: changePercentage
      })
    }

    return trends
  }

  private identifyIrregularExpenses(expenseTransactions: Transaction[]): IrregularExpense[] {
    // Group by merchant/description to identify irregular but recurring expenses
    const expenseMap = new Map<string, Transaction[]>()
    
    expenseTransactions.forEach(transaction => {
      const key = transaction.merchant_name || transaction.name || 'Unknown'
      if (!expenseMap.has(key)) {
        expenseMap.set(key, [])
      }
      expenseMap.get(key)!.push(transaction)
    })

    const irregularExpenses: IrregularExpense[] = []

    expenseMap.forEach((transactions, description) => {
      // Look for expenses that occur infrequently but are significant
      if (transactions.length >= 2 && transactions.length <= 4) {
        const averageAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
        
        if (averageAmount > 100) { // Significant amount threshold
          const frequency = this.determineFrequency(transactions)
          const predictable = transactions.length >= 3
          
          irregularExpenses.push({
            description,
            amount: averageAmount,
            frequency,
            predictable
          })
        }
      }
    })

    return irregularExpenses.sort((a, b) => b.amount - a.amount)
  }

  private calculateSavingsPotential(
    categoryBreakdown: CategorySpending[], 
    monthlyIncome: number
  ): number {
    const potentialSavings = categoryBreakdown.reduce((total, category) => {
      const categorySavings = category.monthly_average * (category.optimization_potential / 100)
      return total + categorySavings
    }, 0)

    return monthlyIncome > 0 ? (potentialSavings / monthlyIncome) * 100 : 0
  }

  private identifyRedFlags(
    categoryBreakdown: CategorySpending[], 
    incomeStability: IncomeStability, 
    totalMonthlySpending: number
  ): string[] {
    const redFlags: string[] = []

    // High spending in discretionary categories
    const highDiscretionarySpending = categoryBreakdown.filter(cat => 
      cat.necessity_score <= 5 && cat.percentage_of_income > 15
    )
    if (highDiscretionarySpending.length > 0) {
      redFlags.push(`High discretionary spending in: ${highDiscretionarySpending.map(c => c.category).join(', ')}`)
    }

    // Income instability
    if (incomeStability.regularity_score < 5) {
      redFlags.push('Irregular income pattern detected')
    }

    // High spending-to-income ratio
    const spendingRatio = (totalMonthlySpending / incomeStability.average_monthly) * 100
    if (spendingRatio > 90) {
      redFlags.push('Spending exceeds 90% of income - low savings rate')
    }

    // Increasing spending trends
    const increasingCategories = categoryBreakdown.filter(cat => cat.trend === 'increasing').length
    if (increasingCategories > 3) {
      redFlags.push('Multiple categories showing increasing spending trends')
    }

    return redFlags
  }

  private generateRecommendations(
    categoryBreakdown: CategorySpending[], 
    incomeStability: IncomeStability
  ): string[] {
    const recommendations: string[] = []

    // High optimization potential categories
    const optimizableCategories = categoryBreakdown.filter(cat => cat.optimization_potential > 20)
    if (optimizableCategories.length > 0) {
      recommendations.push(`Consider reducing spending in: ${optimizableCategories.map(c => c.category).join(', ')}`)
    }

    // Income stability recommendations
    if (incomeStability.regularity_score < 7) {
      recommendations.push('Build a larger emergency fund due to income variability')
    }

    // Savings recommendations
    const totalSpending = categoryBreakdown.reduce((sum, cat) => sum + cat.monthly_average, 0)
    const savingsRate = ((incomeStability.average_monthly - totalSpending) / incomeStability.average_monthly) * 100
    
    if (savingsRate < 20) {
      recommendations.push('Aim to increase savings rate to at least 20% of income')
    }

    return recommendations
  }

  // Helper methods
  private calculateCategoryTrend(amounts: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (amounts.length < 3) return 'stable'
    
    const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2))
    const secondHalf = amounts.slice(Math.floor(amounts.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, a) => sum + a, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, a) => sum + a, 0) / secondHalf.length
    
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100
    
    if (changePercent > 10) return 'increasing'
    if (changePercent < -10) return 'decreasing'
    return 'stable'
  }

  private getNecessityScore(category: string): number {
    const categoryScores: Record<string, number> = {
      'Housing': 10,
      'Rent': 10,
      'Mortgage': 10,
      'Utilities': 9,
      'Groceries': 9,
      'Food': 8,
      'Transportation': 8,
      'Insurance': 8,
      'Healthcare': 8,
      'Childcare': 9,
      'Education': 7,
      'Debt Payments': 9,
      'Phone': 7,
      'Internet': 6,
      'Dining': 4,
      'Entertainment': 3,
      'Shopping': 3,
      'Travel': 2,
      'Subscriptions': 4,
      'Fitness': 5,
      'Beauty': 3,
      'Hobbies': 2
    }

    return categoryScores[category] || 5 // Default middle score
  }

  private getOptimizationPotential(category: string, necessityScore: number): number {
    // Lower necessity scores have higher optimization potential
    const basePotential = Math.max(0, (10 - necessityScore) * 10)
    
    // Category-specific adjustments
    const categoryAdjustments: Record<string, number> = {
      'Dining': 30,
      'Entertainment': 25,
      'Shopping': 35,
      'Travel': 40,
      'Subscriptions': 20,
      'Beauty': 25,
      'Hobbies': 30
    }

    return Math.min(50, basePotential + (categoryAdjustments[category] || 0))
  }

  private determineFrequency(transactions: Transaction[]): 'quarterly' | 'annually' | 'rare' {
    if (transactions.length <= 2) return 'rare'
    
    // Calculate average time between transactions
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime())
    const intervals: number[] = []
    
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24)
      intervals.push(daysDiff)
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    
    if (avgInterval <= 120) return 'quarterly' // ~3-4 months
    if (avgInterval <= 400) return 'annually'  // ~12-13 months
    return 'rare'
  }

  private buildBudgetAnalysisPrompt(
    analysis: SpendingAnalysis,
    goals: FinancialGoal[],
    preferences?: any
  ): string {
    return `
Based on the following financial analysis, create an optimal budget plan:

SPENDING ANALYSIS:
- Monthly Income: $${analysis.income_stability.average_monthly.toFixed(2)}
- Monthly Spending: $${analysis.total_monthly_spending.toFixed(2)}
- Income Stability: ${analysis.income_stability.regularity_score}/10
- Savings Potential: ${analysis.savings_potential.toFixed(1)}%

CATEGORY BREAKDOWN:
${analysis.category_breakdown.map(cat => 
  `- ${cat.category}: $${cat.monthly_average.toFixed(2)} (${cat.percentage_of_income.toFixed(1)}% of spending, Necessity: ${cat.necessity_score}/10)`
).join('\n')}

FINANCIAL GOALS:
${goals.map(goal => 
  `- ${goal.title}: Target $${goal.target_amount.toFixed(2)} by ${goal.target_date.toLocaleDateString()}, Priority: ${goal.priority}`
).join('\n')}

RED FLAGS:
${analysis.red_flags.join('\n- ')}

Please create a comprehensive budget plan that optimizes spending while achieving the user's goals.
    `.trim()
  }
}

export const budgetAnalyzerService = new BudgetAnalyzerService() 