'use client'

import { useState, useEffect } from 'react'
import { Target, TrendingUp, DollarSign, PieChart, Brain, ExternalLink, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { InvestmentGoal, InvestmentRecommendation, RiskProfile, BrokerLink } from '@/types/financial'
import { useFinancialStore } from '@/store/financialStore'

interface InvestmentMatchmakerProps {
  goal: InvestmentGoal
  riskProfile: RiskProfile
  onRecommendationsGenerated: (recommendations: InvestmentRecommendation[]) => void
}

export function InvestmentMatchmaker({ goal, riskProfile, onRecommendationsGenerated }: InvestmentMatchmakerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([])

  useEffect(() => {
    generateRecommendations()
  }, [goal, riskProfile])

  const generateRecommendations = async () => {
    setIsGenerating(true)

    // Simulate AI recommendation generation
    setTimeout(() => {
      const recs = createInvestmentRecommendations(goal, riskProfile)
      setRecommendations(recs)
      onRecommendationsGenerated(recs)
      setIsGenerating(false)
    }, 2000)
  }

  const createInvestmentRecommendations = (goal: InvestmentGoal, risk: RiskProfile): InvestmentRecommendation[] => {
    const timeHorizon = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365))
    const isLongTerm = timeHorizon > 5
    const isRetirement = goal.type === 'retirement'

    const recommendations: InvestmentRecommendation[] = []

    // Tax-advantaged account recommendations for retirement goals
    if (isRetirement && goal.account_type === 'roth_ira') {
      if (risk.category === 'aggressive' && isLongTerm) {
        recommendations.push({
          id: `rec_${Date.now()}_1`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          description: 'Complete US stock market exposure with historically strong long-term returns',
          allocation_percentage: 80,
          expected_annual_return: 10.0,
          expense_ratio: 0.03,
          risk_level: 'high',
          reasoning: 'For a 25-year-old with aggressive risk tolerance and 40+ year timeline, total market exposure maximizes growth potential. VTI provides broad diversification across all US companies with minimal fees.',
          confidence_score: 92,
          broker_links: getBrokerLinks('VTI'),
          created_date: new Date()
        })

        recommendations.push({
          id: `rec_${Date.now()}_2`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: 'VTIAX',
          name: 'Vanguard Total International Stock Index',
          description: 'International diversification to reduce US market concentration',
          allocation_percentage: 20,
          expected_annual_return: 8.5,
          expense_ratio: 0.11,
          risk_level: 'medium',
          reasoning: 'International exposure reduces single-country risk and provides access to global growth. 20% allocation maintains US focus while adding diversification.',
          confidence_score: 88,
          broker_links: getBrokerLinks('VTIAX'),
          created_date: new Date()
        })
      } else if (risk.category === 'moderate') {
        recommendations.push({
          id: `rec_${Date.now()}_3`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: 'VOO',
          name: 'Vanguard S&P 500 ETF',
          description: 'S&P 500 exposure with historically consistent 10% annualized returns',
          allocation_percentage: 60,
          expected_annual_return: 9.8,
          expense_ratio: 0.03,
          risk_level: 'medium',
          reasoning: 'VOO tracks the S&P 500 with rock-bottom fees. Perfect core holding for moderate risk tolerance with proven long-term performance.',
          confidence_score: 95,
          broker_links: getBrokerLinks('VOO'),
          created_date: new Date()
        })

        recommendations.push({
          id: `rec_${Date.now()}_4`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          description: 'Broad bond exposure for stability and income generation',
          allocation_percentage: 40,
          expected_annual_return: 4.2,
          expense_ratio: 0.03,
          risk_level: 'low',
          reasoning: 'Bonds provide portfolio stability and steady income. 40% allocation balances growth with risk reduction appropriate for moderate investors.',
          confidence_score: 90,
          broker_links: getBrokerLinks('BND'),
          created_date: new Date()
        })
      } else {
        recommendations.push({
          id: `rec_${Date.now()}_5`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: 'VTEB',
          name: 'Vanguard Tax-Exempt Bond ETF',
          description: 'Tax-free municipal bonds for conservative investors',
          allocation_percentage: 70,
          expected_annual_return: 3.8,
          expense_ratio: 0.05,
          risk_level: 'low',
          reasoning: 'Tax-exempt bonds provide steady, tax-free income ideal for conservative investors. Lower volatility protects capital while generating returns.',
          confidence_score: 85,
          broker_links: getBrokerLinks('VTEB'),
          created_date: new Date()
        })

        recommendations.push({
          id: `rec_${Date.now()}_6`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          description: 'Limited stock exposure for growth potential',
          allocation_percentage: 30,
          expected_annual_return: 10.0,
          expense_ratio: 0.03,
          risk_level: 'medium',
          reasoning: 'Small stock allocation provides growth potential while maintaining overall conservative approach. Helps combat inflation over long term.',
          confidence_score: 82,
          broker_links: getBrokerLinks('VTI'),
          created_date: new Date()
        })
      }
    }

    // Short-term savings goals
    if (timeHorizon <= 2) {
      recommendations.push({
        id: `rec_${Date.now()}_7`,
        goal_id: goal.id,
        recommendation_type: 'savings_account',
        symbol: 'HYSA',
        name: 'High-Yield Savings Account',
        description: 'FDIC-insured savings with competitive interest rates',
        allocation_percentage: 80,
        expected_annual_return: 4.5,
        expense_ratio: 0,
        risk_level: 'low',
        reasoning: 'For goals under 2 years, capital preservation is critical. High-yield savings accounts offer safety plus competitive returns without market risk.',
        confidence_score: 98,
        broker_links: [
          { broker_name: 'Marcus by Goldman Sachs', url: 'https://marcus.com', has_commission: false, minimum_investment: 0 },
          { broker_name: 'Ally Bank', url: 'https://ally.com', has_commission: false, minimum_investment: 0 }
        ],
        created_date: new Date()
      })

      recommendations.push({
        id: `rec_${Date.now()}_8`,
        goal_id: goal.id,
        recommendation_type: 'bond',
        symbol: 'SHY',
        name: 'iShares 1-3 Year Treasury Bond ETF',
        description: 'Short-term government bonds for slightly higher yield',
        allocation_percentage: 20,
        expected_annual_return: 4.8,
        expense_ratio: 0.15,
        risk_level: 'low',
        reasoning: 'Short-term Treasuries offer slightly higher yield than savings accounts with minimal risk. Perfect for portion of short-term goal money.',
        confidence_score: 85,
        broker_links: getBrokerLinks('SHY'),
        created_date: new Date()
      })
    }

    // House purchase goals (medium-term)
    if (goal.type === 'house' && timeHorizon >= 3 && timeHorizon <= 7) {
      recommendations.push({
        id: `rec_${Date.now()}_9`,
        goal_id: goal.id,
        recommendation_type: 'etf',
        symbol: 'VT',
        name: 'Vanguard Total World Stock ETF',
        description: 'Global stock exposure for medium-term growth',
        allocation_percentage: 50,
        expected_annual_return: 9.2,
        expense_ratio: 0.08,
        risk_level: 'medium',
        reasoning: 'Medium-term timeline allows for moderate stock exposure. Global diversification reduces risk while maintaining growth potential for house down payment.',
        confidence_score: 87,
        broker_links: getBrokerLinks('VT'),
        created_date: new Date()
      })

      recommendations.push({
        id: `rec_${Date.now()}_10`,
        goal_id: goal.id,
        recommendation_type: 'bond',
        symbol: 'VTEB',
        name: 'Vanguard Tax-Exempt Bond ETF',
        description: 'Stable bond income to balance portfolio risk',
        allocation_percentage: 50,
        expected_annual_return: 3.8,
        expense_ratio: 0.05,
        risk_level: 'low',
        reasoning: 'Bonds provide stability crucial for house purchase timeline. Tax-exempt feature improves after-tax returns for goal achievement.',
        confidence_score: 90,
        broker_links: getBrokerLinks('VTEB'),
        created_date: new Date()
      })
    }

    return recommendations
  }

  const getBrokerLinks = (symbol: string): BrokerLink[] => {
    return [
      { broker_name: 'Vanguard', url: `https://investor.vanguard.com/etf/profile/${symbol}`, has_commission: false, minimum_investment: 1 },
      { broker_name: 'Fidelity', url: `https://www.fidelity.com/etfs/summary/${symbol}`, has_commission: false, minimum_investment: 1 },
      { broker_name: 'Schwab', url: `https://www.schwab.com/research/etfs/quotes/summary/${symbol}`, has_commission: false, minimum_investment: 1 },
      { broker_name: 'E*TRADE', url: `https://us.etrade.com/etf/profile/${symbol}`, has_commission: false, minimum_investment: 1 }
    ]
  }

  if (isGenerating) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            <Brain className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Generating Investment Recommendations</h3>
          <p className="text-slate-600">
            Analyzing your goals, risk profile, and market conditions to find the best investment matches...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {recommendations.map((recommendation, index) => (
        <InvestmentRecommendationCard 
          key={recommendation.id} 
          recommendation={recommendation}
          index={index}
        />
      ))}
    </div>
  )
}

interface InvestmentRecommendationCardProps {
  recommendation: InvestmentRecommendation
  index: number
}

function InvestmentRecommendationCard({ recommendation, index }: InvestmentRecommendationCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'etf': return PieChart
      case 'mutual_fund': return Target
      case 'savings_account': return DollarSign
      case 'bond': return TrendingUp
      default: return Target
    }
  }

  const TypeIcon = getTypeIcon(recommendation.recommendation_type)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <TypeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-lg font-bold text-slate-900">{recommendation.symbol}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(recommendation.risk_level)}`}>
                {recommendation.risk_level} risk
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {recommendation.allocation_percentage}% allocation
              </span>
            </div>
            <h5 className="font-semibold text-slate-900 mb-1">{recommendation.name}</h5>
            <p className="text-sm text-slate-600 mb-3">{recommendation.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 text-sm text-slate-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{recommendation.confidence_score}% confidence</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-600 mb-1">Expected Return</div>
          <div className="text-lg font-bold text-green-600">{recommendation.expected_annual_return.toFixed(1)}%</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-600 mb-1">Expense Ratio</div>
          <div className="text-lg font-bold text-slate-900">{recommendation.expense_ratio.toFixed(2)}%</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-600 mb-1">Type</div>
          <div className="text-lg font-bold text-slate-900 capitalize">
            {recommendation.recommendation_type.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h6 className="font-semibold text-blue-900 mb-1">AI Reasoning</h6>
            <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h6 className="font-semibold text-slate-900 mb-3">Where to Buy</h6>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {recommendation.broker_links.map((broker, brokerIndex) => (
            <a
              key={brokerIndex}
              href={broker.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
            >
              <span>{broker.broker_name}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
          <span>✓ Commission-free</span>
          <span>✓ $1 minimum</span>
          <span>✓ No account fees</span>
        </div>
      </div>
    </div>
  )
}

// Goal Creation Component
interface InvestmentGoalCreatorProps {
  onGoalCreated: (goal: InvestmentGoal) => void
}

export function InvestmentGoalCreator({ onGoalCreated }: InvestmentGoalCreatorProps) {
  const { user } = useFinancialStore()
  const [formData, setFormData] = useState({
    title: '',
    type: 'retirement' as InvestmentGoal['type'],
    target_amount: '',
    target_date: '',
    current_amount: '',
    monthly_contribution: '',
    priority: 'medium' as InvestmentGoal['priority'],
    account_type: 'roth_ira' as InvestmentGoal['account_type']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const goal: InvestmentGoal = {
      id: `goal_${Date.now()}`,
      title: formData.title,
      type: formData.type,
      target_amount: parseFloat(formData.target_amount),
      target_date: new Date(formData.target_date),
      current_amount: parseFloat(formData.current_amount) || 0,
      monthly_contribution: parseFloat(formData.monthly_contribution) || 0,
      priority: formData.priority,
      risk_tolerance: 'moderate', // Will be determined by risk profiler
      account_type: formData.account_type,
      created_date: new Date(),
      updated_date: new Date()
    }

    onGoalCreated(goal)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50">
      <div className="flex items-center space-x-2 mb-6">
        <Target className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-slate-900">Create Investment Goal</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Goal Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Retire at 60, House down payment"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Goal Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="retirement">Retirement</option>
              <option value="house">House Purchase</option>
              <option value="education">Education</option>
              <option value="emergency">Emergency Fund</option>
              <option value="wealth_building">Wealth Building</option>
              <option value="custom">Custom Goal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Amount</label>
            <input
              type="number"
              value={formData.target_amount}
              onChange={(e) => handleInputChange('target_amount', e.target.value)}
              placeholder="1000000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Date</label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => handleInputChange('target_date', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Amount (Optional)</label>
            <input
              type="number"
              value={formData.current_amount}
              onChange={(e) => handleInputChange('current_amount', e.target.value)}
              placeholder="25000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Contribution</label>
            <input
              type="number"
              value={formData.monthly_contribution}
              onChange={(e) => handleInputChange('monthly_contribution', e.target.value)}
              placeholder="500"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account Type</label>
            <select
              value={formData.account_type}
              onChange={(e) => handleInputChange('account_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="roth_ira">Roth IRA</option>
              <option value="traditional_ira">Traditional IRA</option>
              <option value="401k">401(k)</option>
              <option value="brokerage">Taxable Brokerage</option>
              <option value="savings">High-Yield Savings</option>
              <option value="hsa">HSA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Target className="h-5 w-5" />
          <span className="font-medium">Create Investment Goal</span>
        </button>
      </form>
    </div>
  )
} 