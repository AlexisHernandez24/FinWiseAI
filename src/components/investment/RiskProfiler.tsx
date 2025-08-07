'use client'

import { useState } from 'react'
import { Target, TrendingUp, AlertTriangle, Brain, Clock, DollarSign, Shield, Zap } from 'lucide-react'
import { RiskProfile, RiskQuestionResponse, BehavioralRiskFactors } from '@/types/financial'
import { useFinancialStore } from '@/store/financialStore'

interface RiskQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'scale' | 'number'
  options?: string[]
  min?: number
  max?: number
  weight: number
  category: 'time_horizon' | 'volatility_comfort' | 'experience' | 'financial_situation' | 'goals'
}

const riskQuestions: RiskQuestion[] = [
  {
    id: 'time_horizon',
    question: 'What is your primary investment time horizon?',
    type: 'multiple_choice',
    options: ['Less than 2 years', '2-5 years', '5-10 years', '10-20 years', 'More than 20 years'],
    weight: 25,
    category: 'time_horizon'
  },
  {
    id: 'market_drop',
    question: 'If your investments dropped 20% in a month, what would you do?',
    type: 'multiple_choice',
    options: [
      'Sell everything immediately',
      'Sell some to reduce risk',
      'Hold and wait for recovery',
      'Buy more at lower prices'
    ],
    weight: 30,
    category: 'volatility_comfort'
  },
  {
    id: 'investment_experience',
    question: 'How many years of investment experience do you have?',
    type: 'multiple_choice',
    options: ['None', '1-2 years', '3-5 years', '6-10 years', 'More than 10 years'],
    weight: 15,
    category: 'experience'
  },
  {
    id: 'risk_comfort',
    question: 'Rate your comfort with investment risk (1 = Very Conservative, 10 = Very Aggressive)',
    type: 'scale',
    min: 1,
    max: 10,
    weight: 20,
    category: 'volatility_comfort'
  },
  {
    id: 'emergency_fund',
    question: 'How many months of expenses do you have in emergency savings?',
    type: 'multiple_choice',
    options: ['Less than 1 month', '1-3 months', '3-6 months', '6-12 months', 'More than 12 months'],
    weight: 10,
    category: 'financial_situation'
  },
  {
    id: 'income_stability',
    question: 'How stable is your income?',
    type: 'multiple_choice',
    options: ['Very unstable', 'Somewhat unstable', 'Stable', 'Very stable', 'Multiple income sources'],
    weight: 15,
    category: 'financial_situation'
  },
  {
    id: 'investment_goal',
    question: 'What is your primary investment goal?',
    type: 'multiple_choice',
    options: [
      'Preserve capital (safety first)',
      'Generate steady income',
      'Balanced growth and income',
      'Long-term growth',
      'Maximum growth (high risk/reward)'
    ],
    weight: 20,
    category: 'goals'
  }
]

interface RiskProfilerProps {
  onComplete: (riskProfile: RiskProfile) => void
  onSkip?: () => void
}

export function RiskProfiler({ onComplete, onSkip }: RiskProfilerProps) {
  const { user, transactions, getMonthlyIncome, getMonthlyExpenses } = useFinancialStore()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<RiskQuestionResponse[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnswer = (answer: string | number) => {
    const question = riskQuestions[currentQuestion]
    const response: RiskQuestionResponse = {
      question_id: question.id,
      question: question.question,
      answer: answer,
      weight: question.weight
    }

    const newResponses = [...responses]
    newResponses[currentQuestion] = response
    setResponses(newResponses)

    if (currentQuestion < riskQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      analyzeRiskProfile(newResponses)
    }
  }

  const analyzeRiskProfile = async (questionResponses: RiskQuestionResponse[]) => {
    setIsAnalyzing(true)

    // Calculate behavioral factors from financial data
    const behavioralFactors = calculateBehavioralFactors()

    // Calculate questionnaire score (0-100)
    const questionnaireScore = calculateQuestionnaireScore(questionResponses)

    // Weight questionnaire vs behavioral analysis (70/30 split)
    const overallScore = Math.round(questionnaireScore * 0.7 + behavioralFactors.behavioral_score * 0.3)

    // Determine risk category
    let category: 'conservative' | 'moderate' | 'aggressive'
    if (overallScore <= 35) category = 'conservative'
    else if (overallScore <= 70) category = 'moderate'
    else category = 'aggressive'

    // Calculate confidence based on data availability
    const confidenceScore = calculateConfidenceScore(questionResponses, behavioralFactors)

    const riskProfile: RiskProfile = {
      id: `risk_${Date.now()}`,
      user_id: user?.id || 'anonymous',
      overall_score: overallScore,
      category,
      questionnaire_responses: questionResponses,
      behavioral_analysis: {
        spending_volatility: behavioralFactors.spending_volatility,
        emergency_fund_ratio: behavioralFactors.emergency_fund_ratio,
        debt_to_income_ratio: behavioralFactors.debt_to_income_ratio,
        investment_experience_years: getExperienceFromResponse(questionResponses),
        age: 35, // This would come from user profile
        income_stability: behavioralFactors.income_stability
      },
      confidence_score: confidenceScore,
      created_date: new Date(),
      last_updated: new Date()
    }

    setTimeout(() => {
      setIsAnalyzing(false)
      onComplete(riskProfile)
    }, 2000)
  }

  const calculateBehavioralFactors = () => {
    const monthlyIncome = getMonthlyIncome()
    const monthlyExpenses = getMonthlyExpenses()

    // Calculate spending volatility (coefficient of variation)
    const spendingVolatility = calculateSpendingVolatility()

    // Emergency fund ratio (would need emergency fund amount from user data)
    const emergencyFundRatio = 3 // Default to 3 months

    // Debt to income ratio (would need debt information)
    const debtToIncomeRatio = 0.2 // Default assumption

    // Income stability based on transaction patterns
    const incomeStability = calculateIncomeStability()

    // Behavioral score (0-100) based on financial behavior
    const behavioralScore = Math.round(
      (incomeStability * 0.3) +
      ((10 - spendingVolatility) * 10 * 0.2) + // Lower volatility = higher score
      ((emergencyFundRatio / 12) * 100 * 0.3) + // More emergency fund = higher score
      ((1 - debtToIncomeRatio) * 100 * 0.2) // Lower debt = higher score
    )

    return {
      spending_volatility: spendingVolatility,
      emergency_fund_ratio: emergencyFundRatio,
      debt_to_income_ratio: debtToIncomeRatio,
      income_stability: incomeStability,
      behavioral_score: Math.min(behavioralScore, 100)
    }
  }

  const calculateSpendingVolatility = () => {
    if (transactions.length < 30) return 5 // Default moderate volatility

    const monthlySpending = transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const month = new Date(t.date).toISOString().slice(0, 7)
        acc[month] = (acc[month] || 0) + Math.abs(t.amount)
        return acc
      }, {} as Record<string, number>)

    const spendingValues = Object.values(monthlySpending)
    if (spendingValues.length < 2) return 5

    const mean = spendingValues.reduce((sum, val) => sum + val, 0) / spendingValues.length
    const variance = spendingValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / spendingValues.length
    const standardDeviation = Math.sqrt(variance)
    
    return Math.min(standardDeviation / mean * 10, 10) // Scale to 0-10
  }

  const calculateIncomeStability = () => {
    // Analyze income transaction patterns
    const incomeTransactions = transactions.filter(t => t.amount > 1000) // Assume income transactions
    if (incomeTransactions.length < 3) return 7 // Default stable

    // Calculate regularity of income
    const intervals = []
    for (let i = 1; i < incomeTransactions.length; i++) {
      const diff = new Date(incomeTransactions[i].date).getTime() - new Date(incomeTransactions[i-1].date).getTime()
      intervals.push(diff / (1000 * 60 * 60 * 24)) // Days between transactions
    }

    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
    const coefficient = Math.sqrt(variance) / avgInterval

    return Math.max(1, Math.min(10, 10 - coefficient * 5)) // Lower coefficient = more stable
  }

  const calculateQuestionnaireScore = (responses: RiskQuestionResponse[]) => {
    let weightedScore = 0
    let totalWeight = 0

    responses.forEach(response => {
      let score = 0
      
      if (typeof response.answer === 'number') {
        score = (response.answer / 10) * 100 // Scale 1-10 to 0-100
      } else {
        const question = riskQuestions.find(q => q.id === response.question_id)
        if (question?.options) {
          const answerIndex = question.options.indexOf(response.answer as string)
          score = (answerIndex / (question.options.length - 1)) * 100
        }
      }

      weightedScore += score * response.weight
      totalWeight += response.weight
    })

    return totalWeight > 0 ? weightedScore / totalWeight : 50
  }

  const calculateConfidenceScore = (responses: RiskQuestionResponse[], behavioralFactors: any) => {
    let confidence = 70 // Base confidence

    // Increase confidence with more transaction data
    if (transactions.length > 100) confidence += 15
    else if (transactions.length > 50) confidence += 10
    else if (transactions.length > 20) confidence += 5

    // Increase confidence with complete responses
    if (responses.length === riskQuestions.length) confidence += 10

    // Decrease confidence if behavioral analysis is limited
    if (transactions.length < 10) confidence -= 20

    return Math.min(confidence, 95)
  }

  const getExperienceFromResponse = (responses: RiskQuestionResponse[]) => {
    const experienceResponse = responses.find(r => r.question_id === 'investment_experience')
    if (!experienceResponse) return 0

    const experienceMap: Record<string, number> = {
      'None': 0,
      '1-2 years': 1.5,
      '3-5 years': 4,
      '6-10 years': 8,
      'More than 10 years': 12
    }

    return experienceMap[experienceResponse.answer as string] || 0
  }

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const progressPercentage = ((currentQuestion + 1) / riskQuestions.length) * 100

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            <Brain className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Your Risk Profile</h3>
          <p className="text-slate-600">
            Our AI is processing your responses and analyzing your financial behavior patterns...
          </p>
        </div>
      </div>
    )
  }

  const question = riskQuestions[currentQuestion]

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Risk Tolerance Assessment</h3>
          </div>
          <div className="text-sm text-slate-500">
            {currentQuestion + 1} of {riskQuestions.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 mb-4">{question.question}</h4>
          
          {question.type === 'multiple_choice' && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <span className="font-medium text-slate-900">{option}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === 'scale' && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Very Conservative</span>
                <span>Very Aggressive</span>
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value)}
                    className="flex-1 py-3 text-center rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          
          <div className="flex space-x-3">
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Skip Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface RiskProfileDisplayProps {
  riskProfile: RiskProfile
  showDetails?: boolean
}

export function RiskProfileDisplay({ riskProfile, showDetails = false }: RiskProfileDisplayProps) {
  const getRiskColor = (category: string) => {
    switch (category) {
      case 'conservative': return 'text-green-600 bg-green-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'aggressive': return 'text-red-600 bg-red-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'conservative': return Shield
      case 'moderate': return Target
      case 'aggressive': return Zap
      default: return Target
    }
  }

  const RiskIcon = getRiskIcon(riskProfile.category)

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <RiskIcon className="h-5 w-5 text-slate-600" />
          <span className="font-medium text-slate-900">Risk Profile</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskProfile.category)}`}>
          {riskProfile.category.charAt(0).toUpperCase() + riskProfile.category.slice(1)}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Risk Score</span>
          <span className="font-medium text-slate-900">{riskProfile.overall_score}/100</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Confidence</span>
          <span className="font-medium text-slate-900">{riskProfile.confidence_score}%</span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="font-medium text-slate-900 mb-2">Behavioral Factors</h4>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Emergency Fund</span>
              <span>{riskProfile.behavioral_analysis.emergency_fund_ratio} months</span>
            </div>
            <div className="flex justify-between">
              <span>Experience</span>
              <span>{riskProfile.behavioral_analysis.investment_experience_years} years</span>
            </div>
            <div className="flex justify-between">
              <span>Income Stability</span>
              <span>{riskProfile.behavioral_analysis.income_stability}/10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 