import { 
  InvestmentGoal, 
  RiskProfile, 
  InvestmentRecommendation, 
  PortfolioSimulation, 
  RebalancingAlert,
  BehavioralRiskFactors,
  RiskQuestionResponse,
  AllocationMix,
  SimulationResults,
  MonthlyProjection,
  RiskMetrics,
  MarketData,
  ETFData,
  BrokerLink
} from '@/types/financial'

// Risk Assessment Questions
export const RISK_ASSESSMENT_QUESTIONS = [
  {
    id: 'time_horizon',
    question: 'How long can you invest this money before needing it?',
    type: 'select',
    options: [
      { value: 1, label: 'Less than 1 year', score: 10 },
      { value: 2, label: '1-3 years', score: 20 },
      { value: 3, label: '3-5 years', score: 40 },
      { value: 4, label: '5-10 years', score: 60 },
      { value: 5, label: '10+ years', score: 80 }
    ],
    weight: 0.25
  },
  {
    id: 'volatility_comfort',
    question: 'If your investment lost 20% in one month, you would:',
    type: 'select',
    options: [
      { value: 1, label: 'Sell immediately to prevent further losses', score: 10 },
      { value: 2, label: 'Worry but hold onto the investment', score: 30 },
      { value: 3, label: 'Hold and wait for recovery', score: 60 },
      { value: 4, label: 'Buy more while prices are low', score: 80 }
    ],
    weight: 0.30
  },
  {
    id: 'priority',
    question: 'Your investment priority is:',
    type: 'select',
    options: [
      { value: 1, label: 'Preserve capital, minimal risk', score: 20 },
      { value: 2, label: 'Generate steady income', score: 40 },
      { value: 3, label: 'Balance growth and stability', score: 60 },
      { value: 4, label: 'Maximize long-term growth', score: 80 }
    ],
    weight: 0.25
  },
  {
    id: 'experience',
    question: 'Your investment experience level:',
    type: 'select',
    options: [
      { value: 1, label: 'Beginner (0-2 years)', score: 30 },
      { value: 2, label: 'Some experience (2-5 years)', score: 50 },
      { value: 3, label: 'Experienced (5-10 years)', score: 70 },
      { value: 4, label: 'Very experienced (10+ years)', score: 80 }
    ],
    weight: 0.20
  }
] as const

// Sample ETF Database (in production, this would come from a real financial API)
export const ETF_DATABASE: ETFData[] = [
  {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    current_price: 240.50,
    change_24h: 2.30,
    change_percentage_24h: 0.96,
    volume: 2500000,
    market_cap: 250000000000,
    expense_ratio: 0.03,
    beta: 1.0,
    category: 'Total Market',
    focus: 'US Total Market',
    inception_date: new Date('2001-05-24'),
    assets_under_management: 250000000000,
    holdings_count: 3700,
    top_holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.2 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 6.8 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.4 }
    ],
    last_updated: new Date()
  },
  {
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    current_price: 415.30,
    change_24h: 3.80,
    change_percentage_24h: 0.92,
    volume: 3200000,
    market_cap: 180000000000,
    expense_ratio: 0.03,
    beta: 1.0,
    category: 'Large Cap',
    focus: 'US Large Cap',
    inception_date: new Date('2010-09-07'),
    assets_under_management: 180000000000,
    holdings_count: 503,
    top_holdings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.3 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 6.9 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.5 }
    ],
    last_updated: new Date()
  },
  {
    symbol: 'VTIAX',
    name: 'Vanguard Total International Stock Index',
    current_price: 32.40,
    change_24h: 0.45,
    change_percentage_24h: 1.41,
    volume: 1800000,
    expense_ratio: 0.11,
    beta: 0.85,
    category: 'International',
    focus: 'International Developed & Emerging',
    inception_date: new Date('2011-01-26'),
    assets_under_management: 45000000000,
    holdings_count: 7800,
    top_holdings: [
      { symbol: 'TSMC', name: 'Taiwan Semiconductor', weight: 4.1 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 3.2 },
      { symbol: 'ASML', name: 'ASML Holding NV', weight: 1.8 }
    ],
    last_updated: new Date()
  },
  {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    current_price: 77.20,
    change_24h: -0.15,
    change_percentage_24h: -0.19,
    volume: 4500000,
    expense_ratio: 0.03,
    beta: 0.2,
    category: 'Bond',
    focus: 'US Total Bond Market',
    inception_date: new Date('2007-04-03'),
    assets_under_management: 75000000000,
    holdings_count: 10500,
    top_holdings: [
      { symbol: 'UST', name: 'US Treasury Notes', weight: 42.5 },
      { symbol: 'MBS', name: 'Mortgage-Backed Securities', weight: 26.8 },
      { symbol: 'CORP', name: 'Corporate Bonds', weight: 25.3 }
    ],
    last_updated: new Date()
  }
]

export class InvestmentMatchmakerService {
  private openaiService: any // Will be injected

  constructor(openaiService?: any) {
    this.openaiService = openaiService
  }

  // Calculate Risk Profile from questionnaire and behavioral data
  calculateRiskProfile(
    responses: RiskQuestionResponse[],
    behavioralFactors: BehavioralRiskFactors
  ): RiskProfile {
    // Calculate questionnaire score
    const questionnaireScore = responses.reduce((total, response) => {
      const question = RISK_ASSESSMENT_QUESTIONS.find(q => q.id === response.question_id)
      if (!question) return total
      
      const option = question.options.find(opt => opt.value === response.answer)
      return total + (option?.score || 0) * question.weight
    }, 0)

    // Calculate behavioral score
    const behavioralScore = this.calculateBehavioralScore(behavioralFactors)
    
    // Weighted combination
    const overallScore = Math.round(questionnaireScore * 0.7 + behavioralScore * 0.3)
    
    // Categorize risk level
    let category: 'conservative' | 'moderate' | 'aggressive'
    if (overallScore <= 40) category = 'conservative'
    else if (overallScore <= 70) category = 'moderate'
    else category = 'aggressive'

    return {
      id: `risk_${Date.now()}`,
      user_id: '', // Will be set by caller
      overall_score: overallScore,
      category,
      questionnaire_responses: responses,
      behavioral_analysis: behavioralFactors,
      confidence_score: this.calculateConfidenceScore(responses, behavioralFactors),
      created_date: new Date(),
      last_updated: new Date()
    }
  }

  private calculateBehavioralScore(factors: BehavioralRiskFactors): number {
    let score = 50 // Start with neutral

    // Age factor (younger = higher risk tolerance)
    if (factors.age < 30) score += 20
    else if (factors.age < 40) score += 10
    else if (factors.age > 60) score -= 20

    // Emergency fund ratio
    if (factors.emergency_fund_ratio >= 6) score += 15
    else if (factors.emergency_fund_ratio < 3) score -= 15

    // Debt to income ratio
    if (factors.debt_to_income_ratio > 0.4) score -= 20
    else if (factors.debt_to_income_ratio < 0.2) score += 10

    // Income stability
    score += (factors.income_stability - 5) * 3

    // Investment experience
    score += factors.investment_experience_years * 2

    // Spending volatility (lower volatility = higher risk tolerance)
    score -= factors.spending_volatility * 10

    return Math.max(10, Math.min(90, score))
  }

  private calculateConfidenceScore(
    responses: RiskQuestionResponse[],
    behavioralFactors: BehavioralRiskFactors
  ): number {
    let confidence = 85

    // Lower confidence if inconsistent answers
    const responseVariance = this.calculateResponseVariance(responses)
    confidence -= responseVariance * 20

    // Lower confidence for very young or inexperienced investors
    if (behavioralFactors.age < 25 || behavioralFactors.investment_experience_years < 1) {
      confidence -= 15
    }

    // Lower confidence if high debt or no emergency fund
    if (behavioralFactors.debt_to_income_ratio > 0.5 || behavioralFactors.emergency_fund_ratio < 1) {
      confidence -= 10
    }

    return Math.max(60, Math.min(95, confidence))
  }

  private calculateResponseVariance(responses: RiskQuestionResponse[]): number {
    const scores = responses.map(response => {
      const question = RISK_ASSESSMENT_QUESTIONS.find(q => q.id === response.question_id)
      const option = question?.options.find(opt => opt.value === response.answer)
      return option?.score || 50
    })

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    
    return Math.sqrt(variance) / 100 // Normalize to 0-1
  }

  // Generate Investment Recommendations based on goal and risk profile
  async generateRecommendations(
    goal: InvestmentGoal,
    riskProfile: RiskProfile
  ): Promise<InvestmentRecommendation[]> {
    const recommendations: InvestmentRecommendation[] = []
    
    // Get appropriate allocation mix for risk profile
    const allocationMix = this.getTargetAllocation(riskProfile.category, goal)
    
    // Generate recommendations based on account type and allocation
    if (goal.account_type === 'roth_ira' || goal.account_type === 'traditional_ira') {
      recommendations.push(...this.getIRARecommendations(allocationMix, goal))
    } else if (goal.account_type === 'brokerage') {
      recommendations.push(...this.getBrokerageRecommendations(allocationMix, goal))
    } else if (goal.account_type === 'savings') {
      recommendations.push(...this.getSavingsRecommendations(goal))
    }

    // Add AI-generated reasoning if OpenAI is available
    if (this.openaiService?.isConnected()) {
      for (const rec of recommendations) {
        rec.reasoning = await this.generateAIReasoning(rec, goal, riskProfile)
      }
    }

    return recommendations.sort((a, b) => b.confidence_score - a.confidence_score)
  }

  private getTargetAllocation(riskCategory: string, goal: InvestmentGoal): AllocationMix {
    const yearsToGoal = (goal.target_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)
    
    let baseAllocation: AllocationMix

    if (riskCategory === 'conservative') {
      baseAllocation = {
        stocks_us: 40,
        stocks_international: 10,
        bonds: 45,
        real_estate: 3,
        commodities: 1,
        cash: 1
      }
    } else if (riskCategory === 'moderate') {
      baseAllocation = {
        stocks_us: 60,
        stocks_international: 20,
        bonds: 15,
        real_estate: 3,
        commodities: 1,
        cash: 1
      }
    } else { // aggressive
      baseAllocation = {
        stocks_us: 70,
        stocks_international: 25,
        bonds: 2,
        real_estate: 2,
        commodities: 1,
        cash: 0
      }
    }

    // Adjust based on time horizon
    if (yearsToGoal < 3) {
      // Short-term: increase bonds and cash
      baseAllocation.bonds += 20
      baseAllocation.cash += 10
      baseAllocation.stocks_us -= 20
      baseAllocation.stocks_international -= 10
    } else if (yearsToGoal > 20) {
      // Long-term: increase stocks
      baseAllocation.stocks_us += 10
      baseAllocation.stocks_international += 5
      baseAllocation.bonds -= 15
    }

    return baseAllocation
  }

  private getIRARecommendations(allocation: AllocationMix, goal: InvestmentGoal): InvestmentRecommendation[] {
    const recommendations: InvestmentRecommendation[] = []

    // US Stocks recommendation
    if (allocation.stocks_us > 0) {
      const etf = allocation.stocks_us > 60 ? ETF_DATABASE.find(e => e.symbol === 'VTI') : ETF_DATABASE.find(e => e.symbol === 'VOO')
      if (etf) {
        recommendations.push({
          id: `rec_${Date.now()}_us_stocks`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: etf.symbol,
          name: etf.name,
          description: `Low-cost ${etf.focus} exposure for long-term growth`,
          allocation_percentage: allocation.stocks_us,
          expected_annual_return: 10.5,
          expense_ratio: etf.expense_ratio || 0.03,
          risk_level: 'medium',
          reasoning: `Perfect for ${goal.account_type} due to tax efficiency and broad diversification`,
          confidence_score: 92,
          broker_links: this.getBrokerLinks(etf.symbol),
          created_date: new Date()
        })
      }
    }

    // International Stocks
    if (allocation.stocks_international > 0) {
      const etf = ETF_DATABASE.find(e => e.symbol === 'VTIAX')
      if (etf) {
        recommendations.push({
          id: `rec_${Date.now()}_intl_stocks`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: etf.symbol,
          name: etf.name,
          description: 'International diversification across developed and emerging markets',
          allocation_percentage: allocation.stocks_international,
          expected_annual_return: 9.8,
          expense_ratio: etf.expense_ratio || 0.11,
          risk_level: 'medium',
          reasoning: 'Provides geographic diversification and exposure to global growth',
          confidence_score: 88,
          broker_links: this.getBrokerLinks(etf.symbol),
          created_date: new Date()
        })
      }
    }

    // Bonds
    if (allocation.bonds > 0) {
      const etf = ETF_DATABASE.find(e => e.symbol === 'BND')
      if (etf) {
        recommendations.push({
          id: `rec_${Date.now()}_bonds`,
          goal_id: goal.id,
          recommendation_type: 'etf',
          symbol: etf.symbol,
          name: etf.name,
          description: 'Broad bond market exposure for stability and income',
          allocation_percentage: allocation.bonds,
          expected_annual_return: 4.2,
          expense_ratio: etf.expense_ratio || 0.03,
          risk_level: 'low',
          reasoning: 'Provides portfolio stability and reduces overall volatility',
          confidence_score: 90,
          broker_links: this.getBrokerLinks(etf.symbol),
          created_date: new Date()
        })
      }
    }

    return recommendations
  }

  private getBrokerageRecommendations(allocation: AllocationMix, goal: InvestmentGoal): InvestmentRecommendation[] {
    // Similar to IRA but with tax considerations
    const recommendations = this.getIRARecommendations(allocation, goal)
    
    // Adjust reasoning for taxable account
    recommendations.forEach(rec => {
      rec.reasoning += '. Consider tax-efficient index funds for taxable accounts.'
    })

    return recommendations
  }

  private getSavingsRecommendations(goal: InvestmentGoal): InvestmentRecommendation[] {
    const yearsToGoal = (goal.target_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)
    
    if (yearsToGoal < 2) {
      return [{
        id: `rec_${Date.now()}_savings`,
        goal_id: goal.id,
        recommendation_type: 'savings_account',
        symbol: 'HYSA',
        name: 'High-Yield Savings Account',
        description: 'FDIC-insured savings with competitive interest rates',
        allocation_percentage: 100,
        expected_annual_return: 4.5,
        expense_ratio: 0,
        risk_level: 'low',
        reasoning: 'For short-term goals, prioritize capital preservation and liquidity',
        confidence_score: 95,
        broker_links: [
          { broker_name: 'Marcus by Goldman Sachs', url: 'https://marcus.com', has_commission: false, minimum_investment: 0 },
          { broker_name: 'Ally Bank', url: 'https://ally.com', has_commission: false, minimum_investment: 0 }
        ],
        created_date: new Date()
      }]
    } else {
      return [{
        id: `rec_${Date.now()}_cd`,
        goal_id: goal.id,
        recommendation_type: 'bond',
        symbol: 'CD',
        name: 'Certificate of Deposit',
        description: 'Fixed-rate, FDIC-insured investment for medium-term goals',
        allocation_percentage: 100,
        expected_annual_return: 5.2,
        expense_ratio: 0,
        risk_level: 'low',
        reasoning: 'CDs provide guaranteed returns for specific time horizons',
        confidence_score: 88,
        broker_links: [
          { broker_name: 'Fidelity', url: 'https://fidelity.com', has_commission: false, minimum_investment: 1000 },
          { broker_name: 'Schwab', url: 'https://schwab.com', has_commission: false, minimum_investment: 1000 }
        ],
        created_date: new Date()
      }]
    }
  }

  private getBrokerLinks(symbol: string): BrokerLink[] {
    return [
      {
        broker_name: 'Vanguard',
        url: `https://investor.vanguard.com/etf/profile/${symbol}`,
        has_commission: false,
        minimum_investment: 1
      },
      {
        broker_name: 'Fidelity',
        url: `https://www.fidelity.com/etfs/${symbol.toLowerCase()}`,
        has_commission: false,
        minimum_investment: 1
      },
      {
        broker_name: 'Schwab',
        url: `https://www.schwab.com/research/etfs/quotes/summary/${symbol}`,
        has_commission: false,
        minimum_investment: 1
      }
    ]
  }

  private async generateAIReasoning(
    recommendation: InvestmentRecommendation,
    goal: InvestmentGoal,
    riskProfile: RiskProfile
  ): Promise<string> {
    if (!this.openaiService?.isConnected()) {
      return recommendation.reasoning
    }

    try {
      const prompt = `
        Generate a personalized explanation for this investment recommendation:
        
        Investment: ${recommendation.name} (${recommendation.symbol})
        Goal: ${goal.title} - ${goal.type}
        Target: $${goal.target_amount.toLocaleString()} by ${goal.target_date.toDateString()}
        Risk Profile: ${riskProfile.category}
        Account Type: ${goal.account_type}
        
        Current reasoning: ${recommendation.reasoning}
        
        Provide a clear, educational explanation in 2-3 sentences that explains WHY this recommendation makes sense for this specific goal and risk profile.
      `

      const response = await this.openaiService.generateInsights([{ content: prompt }])
      return response?.content || recommendation.reasoning
    } catch (error) {
      console.error('Error generating AI reasoning:', error)
      return recommendation.reasoning
    }
  }

  // Monte Carlo Portfolio Simulation
  async runPortfolioSimulation(
    goal: InvestmentGoal,
    allocation: AllocationMix,
    monthlyContribution: number,
    timeHorizonYears: number
  ): Promise<PortfolioSimulation> {
    const initialInvestment = goal.current_amount
    const monthsTotal = timeHorizonYears * 12
    const simulations = 1000 // Number of Monte Carlo runs

    // Historical return and volatility data (simplified)
    const assetReturns = {
      stocks_us: { mean: 0.105, volatility: 0.16 },
      stocks_international: { mean: 0.098, volatility: 0.18 },
      bonds: { mean: 0.042, volatility: 0.04 },
      real_estate: { mean: 0.089, volatility: 0.20 },
      commodities: { mean: 0.065, volatility: 0.25 },
      cash: { mean: 0.025, volatility: 0.01 }
    }

    const allResults: number[][] = []

    // Run Monte Carlo simulations
    for (let sim = 0; sim < simulations; sim++) {
      const monthlyResults: number[] = []
      let portfolioValue = initialInvestment

      for (let month = 0; month < monthsTotal; month++) {
        // Add monthly contribution
        portfolioValue += monthlyContribution

        // Calculate weighted portfolio return for this month
        let monthlyReturn = 0
        Object.entries(allocation).forEach(([asset, weight]) => {
          const assetData = assetReturns[asset as keyof typeof assetReturns]
          const randomReturn = this.generateRandomReturn(assetData.mean / 12, assetData.volatility / Math.sqrt(12))
          monthlyReturn += (weight / 100) * randomReturn
        })

        portfolioValue *= (1 + monthlyReturn)
        monthlyResults.push(portfolioValue)
      }

      allResults.push(monthlyResults)
    }

    // Calculate statistics
    const finalValues = allResults.map(results => results[results.length - 1]).sort((a, b) => a - b)
    const successCount = finalValues.filter(value => value >= goal.target_amount).length

    const results: SimulationResults = {
      probability_of_success: successCount / simulations,
      median_outcome: finalValues[Math.floor(simulations / 2)],
      percentile_10: finalValues[Math.floor(simulations * 0.1)],
      percentile_90: finalValues[Math.floor(simulations * 0.9)],
      monthly_projections: this.calculateMonthlyProjections(allResults),
      risk_metrics: this.calculateRiskMetrics(allResults)
    }

    return {
      id: `sim_${Date.now()}`,
      user_id: '', // Will be set by caller
      goal_id: goal.id,
      simulation_type: 'monte_carlo',
      initial_investment: initialInvestment,
      monthly_contribution: monthlyContribution,
      time_horizon_years: timeHorizonYears,
      portfolio_allocation: allocation,
      results,
      created_date: new Date()
    }
  }

  private generateRandomReturn(mean: number, volatility: number): number {
    // Box-Muller transformation for normal distribution
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mean + volatility * z
  }

  private calculateMonthlyProjections(allResults: number[][]): MonthlyProjection[] {
    const projections: MonthlyProjection[] = []
    const monthsTotal = allResults[0].length

    for (let month = 0; month < monthsTotal; month++) {
      const monthValues = allResults.map(results => results[month]).sort((a, b) => a - b)
      
      projections.push({
        month: month + 1,
        median_value: monthValues[Math.floor(monthValues.length / 2)],
        percentile_10: monthValues[Math.floor(monthValues.length * 0.1)],
        percentile_90: monthValues[Math.floor(monthValues.length * 0.9)],
        probability_above_goal: monthValues.filter(v => v >= 0).length / monthValues.length // Simplified
      })
    }

    return projections
  }

  private calculateRiskMetrics(allResults: number[][]): RiskMetrics {
    // Calculate portfolio volatility (simplified)
    const finalValues = allResults.map(results => results[results.length - 1])
    const mean = finalValues.reduce((sum, val) => sum + val, 0) / finalValues.length
    const variance = finalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / finalValues.length
    const volatility = Math.sqrt(variance) / mean

    // Calculate max drawdown (simplified)
    let maxDrawdown = 0
    allResults.forEach(results => {
      let peak = results[0]
      for (const value of results) {
        if (value > peak) peak = value
        const drawdown = (peak - value) / peak
        if (drawdown > maxDrawdown) maxDrawdown = drawdown
      }
    })

    return {
      max_drawdown: maxDrawdown,
      volatility: volatility,
      sharpe_ratio: 1.2, // Simplified calculation
      value_at_risk_5: finalValues[Math.floor(finalValues.length * 0.05)]
    }
  }

  // Generate Portfolio Rebalancing Alerts
  generateRebalancingAlerts(
    currentPortfolio: AllocationMix,
    targetAllocation: AllocationMix,
    threshold: number = 5
  ): RebalancingAlert[] {
    const alerts: RebalancingAlert[] = []

    Object.entries(targetAllocation).forEach(([assetClass, targetPercent]) => {
      const currentPercent = currentPortfolio[assetClass as keyof AllocationMix]
      const deviation = Math.abs(currentPercent - targetPercent)
      
      if (deviation > threshold) {
        const alertType = currentPercent > targetPercent ? 'overweight' : 'underweight'
        
        alerts.push({
          id: `alert_${Date.now()}_${assetClass}`,
          user_id: '',
          portfolio_id: '',
          alert_type: alertType,
          asset_class: assetClass,
          current_allocation: currentPercent,
          target_allocation: targetPercent,
          deviation_percentage: deviation,
          suggested_action: this.generateRebalancingAction(assetClass, alertType, deviation),
          urgency: deviation > 10 ? 'high' : deviation > 7 ? 'medium' : 'low',
          potential_impact: `Rebalancing could improve risk-adjusted returns by ~${(deviation * 0.1).toFixed(1)}%`,
          created_date: new Date(),
          dismissed: false
        })
      }
    })

    return alerts.sort((a, b) => b.deviation_percentage - a.deviation_percentage)
  }

  private generateRebalancingAction(assetClass: string, type: string, deviation: number): string {
    const action = type === 'overweight' ? 'reduce' : 'increase'
    const assetName = assetClass.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    return `${action === 'reduce' ? 'Sell' : 'Buy'} ${assetName} to ${action} allocation by ${deviation.toFixed(1)}%`
  }
}

// Export a singleton instance
export const investmentMatchmaker = new InvestmentMatchmakerService() 