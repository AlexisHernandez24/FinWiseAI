/**
 * AiBudgetGenerator Component - AI-powered budget creation tool
 * Analyzes spending patterns and generates personalized budget recommendations
 */

'use client'

import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { budgetAnalyzerService, AIBudgetPlan, SpendingAnalysis } from '@/lib/budgetAnalyzer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  PieChart,
  Calendar,
  Lightbulb
} from 'lucide-react'

interface AiBudgetGeneratorProps {
  onBudgetGenerated?: (budget: AIBudgetPlan) => void
}

export function AiBudgetGenerator({ onBudgetGenerated }: AiBudgetGeneratorProps) {
  // Component state management
  const { transactions, goals, user } = useFinancialStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [spendingAnalysis, setSpendingAnalysis] = useState<SpendingAnalysis | null>(null)
  const [aiBudget, setAiBudget] = useState<AIBudgetPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisStep, setAnalysisStep] = useState(0)

  // Analysis progress steps
  const analysisSteps = [
    'Analyzing spending patterns',
    'Categorizing expenses',
    'Evaluating income stability', 
    'Identifying optimization opportunities',
    'Generating AI recommendations'
  ]

  // Analyze spending patterns and generate insights
  const handleAnalyzeSpending = async () => {
    if (transactions.length === 0) {
      setError('No transaction data available. Please connect your bank account first.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisStep(0)

    try {
      // Simulate analysis steps for UI feedback
      for (let i = 0; i < 4; i++) {
        setAnalysisStep(i)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Perform actual spending analysis
      const analysis = await budgetAnalyzerService.analyzeSpendingPatterns(transactions, 6)
      setSpendingAnalysis(analysis)
      setAnalysisStep(4)
      
    } catch (err: any) {
      setError(err.message || 'Failed to analyze spending patterns')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Generate AI-powered budget recommendations
  const handleGenerateBudget = async () => {
    if (!spendingAnalysis) return

    setIsGenerating(true)
    setError(null)

    try {
      // Create optimal budget based on analysis and goals
      const budget = await budgetAnalyzerService.generateOptimalBudget(
        spendingAnalysis,
        goals,
        {
          aggressiveness: 'moderate',
          priority_goals: goals.filter(g => g.priority === 'high').map(g => g.id)
        }
      )
      
      setAiBudget(budget)
      onBudgetGenerated?.(budget)
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate budget recommendations')
    } finally {
      setIsGenerating(false)
    }
  }

  // Accept and implement the generated budget
  const handleAcceptBudget = () => {
    if (!aiBudget) return
    // This would integrate with the budget management system
    console.log('Accepting AI budget:', aiBudget)
    onBudgetGenerated?.(aiBudget)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Budget Generator</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our AI analyzes your spending habits, considers your goals, and creates a personalized optimal budget to help you achieve financial success.
          </p>
        </div>
      </div>

      {/* Prerequisites Check */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          Prerequisites Check
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            {transactions.length > 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="font-medium">Transaction Data</div>
              <div className="text-sm text-slate-600">
                {transactions.length} transactions available
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {goals.length > 0 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <div className="font-medium">Financial Goals</div>
              <div className="text-sm text-slate-600">
                {goals.length} goals defined
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="font-medium">User Profile</div>
              <div className="text-sm text-slate-600">
                {user ? 'Profile configured' : 'Profile needed'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div className="text-red-700">{error}</div>
          </div>
        </Card>
      )}

      {/* Step 1: Spending Analysis */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
            Step 1: Analyze Spending Patterns
          </h3>
          {!spendingAnalysis && (
            <Button 
              onClick={handleAnalyzeSpending}
              disabled={isAnalyzing || transactions.length === 0}
              className="btn-primary"
            >
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          )}
        </div>

        {isAnalyzing && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              {analysisSteps[analysisStep]}
            </div>
            <Progress value={(analysisStep / (analysisSteps.length - 1)) * 100} className="w-full" />
          </div>
        )}

        {spendingAnalysis && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Analysis Complete</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">
                  ${spendingAnalysis.total_monthly_spending.toFixed(0)}
                </div>
                <div className="text-sm text-slate-600">Monthly Spending</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <PieChart className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">
                  {spendingAnalysis.category_breakdown.length}
                </div>
                <div className="text-sm text-slate-600">Categories</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">
                  {spendingAnalysis.savings_potential.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">Savings Potential</div>
              </div>
              
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Target className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">
                  {spendingAnalysis.income_stability.regularity_score}/10
                </div>
                <div className="text-sm text-slate-600">Income Stability</div>
              </div>
            </div>

            {spendingAnalysis.red_flags.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {spendingAnalysis.red_flags.map((flag, index) => (
                    <li key={index} className="text-sm text-amber-700">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Step 2: AI Budget Generation */}
      {spendingAnalysis && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Brain className="w-5 h-5 text-purple-500 mr-2" />
              Step 2: Generate AI-Optimized Budget
            </h3>
            {!aiBudget && (
              <Button 
                onClick={handleGenerateBudget}
                disabled={isGenerating}
                className="btn-primary"
              >
                {isGenerating ? 'Generating...' : 'Generate Budget'}
              </Button>
            )}
          </div>

          {isGenerating && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-4"></div>
              <div className="text-slate-600">AI is analyzing your data to create the optimal budget...</div>
            </div>
          )}

          {aiBudget && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-green-600 mb-4">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Budget Generated Successfully</span>
                <Badge variant="secondary" className="ml-2">
                  {aiBudget.confidence_score}% Confidence
                </Badge>
              </div>

              {/* Budget Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-800">
                    ${aiBudget.total_recommended_spending.toFixed(0)}
                  </div>
                  <div className="text-sm text-green-600">Recommended Spending</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-800">
                    {aiBudget.recommended_savings_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-600">Savings Rate</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-800">
                    ${aiBudget.emergency_fund_target.toFixed(0)}
                  </div>
                  <div className="text-sm text-purple-600">Emergency Fund Target</div>
                </div>
              </div>

              {/* Category Recommendations */}
              <div>
                <h4 className="font-semibold mb-3">Budget Category Recommendations</h4>
                <div className="space-y-3">
                  {aiBudget.budget_categories.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-slate-600">{category.reasoning}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${category.recommended_amount.toFixed(0)}
                        </div>
                        <div className={`text-sm ${
                          category.adjustment_percentage > 0 ? 'text-red-600' : 
                          category.adjustment_percentage < 0 ? 'text-green-600' : 'text-slate-600'
                        }`}>
                          {category.adjustment_percentage > 0 ? '+' : ''}
                          {category.adjustment_percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal Allocations */}
              {aiBudget.goal_allocations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Goal Funding Plan</h4>
                  <div className="space-y-3">
                    {aiBudget.goal_allocations.map((allocation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium">{allocation.goal_name}</div>
                            <div className="text-sm text-blue-600">
                              {allocation.timeline_months} months timeline
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-800">
                            ${allocation.monthly_allocation.toFixed(0)}/month
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Priority #{allocation.priority_rank}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalized Tips */}
              {aiBudget.personalized_tips.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Personalized Tips
                  </h4>
                  <ul className="space-y-2">
                    {aiBudget.personalized_tips.map((tip, index) => (
                      <li key={index} className="text-sm text-amber-700 flex items-start">
                        <ArrowRight className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button onClick={handleAcceptBudget} className="btn-primary flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept This Budget
                </Button>
                <Button 
                  onClick={() => setAiBudget(null)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Generate New Budget
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
} 