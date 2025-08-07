// User and Account Types
export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
  preferences: UserPreferences
}

export interface UserPreferences {
  currency: string
  timeZone: string
  budgetAlerts: boolean
  investmentAlerts: boolean
  aiInsights: boolean
  dataSync: boolean
}

// Financial Institution Types
export interface PlaidAccount {
  account_id: string
  balances: {
    available: number | null
    current: number | null
    limit: number | null
  }
  mask: string | null
  name: string
  official_name: string | null
  subtype: string | null
  type: string
}

export interface Transaction {
  id: string
  account_id: string
  amount: number
  date: string
  name: string
  merchant_name?: string
  category: string[]
  subcategory?: string
  location?: {
    address?: string
    city?: string
    region?: string
    postal_code?: string
    country?: string
  }
  payment_channel: string
  pending: boolean
  account_owner?: string
  user_category?: string
  notes?: string
}

export interface Investment {
  account_id: string
  security_id: string
  name: string
  ticker_symbol?: string
  quantity: number
  price: number
  value: number
  cost_basis?: number
  gain_loss?: number
  gain_loss_percentage?: number
  type: 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'crypto' | 'other'
}

// Financial Goals
export interface FinancialGoal {
  id: string
  user_id: string
  title: string
  description: string
  type: 'savings' | 'debt_payoff' | 'investment' | 'retirement' | 'emergency_fund' | 'purchase' | 'custom'
  target_amount: number
  current_amount: number
  target_date: Date
  created_date: Date
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  milestones: GoalMilestone[]
  ai_recommendations?: string[]
  auto_contributions?: AutoContribution
}

export interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  target_amount: number
  target_date: Date
  completed: boolean
  completed_date?: Date
}

export interface AutoContribution {
  enabled: boolean
  amount: number
  frequency: 'weekly' | 'monthly' | 'quarterly'
  account_id: string
  next_contribution_date: Date
}

// Budget Types
export interface Budget {
  id: string
  user_id: string
  category: string
  allocated_amount: number
  spent_amount: number
  period_start: Date
  period_end: Date
  alert_threshold: number
  rollover_enabled: boolean
}

export interface BudgetCategory {
  name: string
  allocated: number
  spent: number
  remaining: number
  transactions: Transaction[]
  subcategories: BudgetSubcategory[]
}

export interface BudgetSubcategory {
  name: string
  allocated: number
  spent: number
  parent_category: string
}

// AI Insights Types
export interface AIInsight {
  id: string
  user_id: string
  type: 'optimization' | 'warning' | 'opportunity' | 'goal_progress' | 'spending_pattern' | 'investment_advice'
  title: string
  description: string
  impact_description: string
  confidence_score: number
  priority: 'low' | 'medium' | 'high'
  category: string
  actionable: boolean
  action_items: string[]
  created_date: Date
  read: boolean
  dismissed: boolean
  related_goal_id?: string
  related_account_id?: string
}

export interface SpendingPattern {
  category: string
  average_monthly: number
  trend: 'increasing' | 'decreasing' | 'stable'
  trend_percentage: number
  seasonal_variations: boolean
  predictions: MonthlyPrediction[]
}

export interface MonthlyPrediction {
  month: string
  predicted_amount: number
  confidence: number
}

// Portfolio and Investment Types
export interface Portfolio {
  id: string
  user_id: string
  name: string
  total_value: number
  total_gain_loss: number
  total_gain_loss_percentage: number
  accounts: InvestmentAccount[]
  asset_allocation: AllocationMix
  performance_metrics: RiskMetrics
  last_rebalance_date: Date
  target_allocation: AllocationMix
  rebalancing_threshold: number // Percentage drift before rebalancing
  created_date: Date
  updated_date: Date
}

export interface InvestmentAccount {
  account_id: string
  name: string
  type: 'brokerage' | '401k' | 'ira' | 'roth_ira' | 'crypto'
  value: number
  investments: Investment[]
}

// AssetAllocation replaced by AllocationMix

// PerformanceMetrics replaced by RiskMetrics

// Plaid Integration Types
export interface PlaidLinkSuccess {
  public_token: string
  metadata: {
    institution: {
      name: string
      institution_id: string
    }
    accounts: Array<{
      id: string
      name: string
      mask: string
      type: string
      subtype: string
    }>
    link_session_id: string
  }
}

export interface ConnectedInstitution {
  id: string
  user_id: string
  institution_id: string
  institution_name: string
  access_token: string
  accounts: PlaidAccount[]
  last_sync: Date
  sync_status: 'active' | 'error' | 'reauth_required'
  error_message?: string
}

// API Response Types
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface DashboardData {
  user: User
  accounts: PlaidAccount[]
  recent_transactions: Transaction[]
  portfolio: Portfolio
  goals: FinancialGoal[]
  budgets: Budget[]
  ai_insights: AIInsight[]
  net_worth: number
  monthly_income: number
  monthly_expenses: number
}

// Scenario Analysis Types
export interface FinancialScenario {
  id: string
  user_id: string
  name: string
  description: string
  type: 'major_purchase' | 'career_change' | 'investment' | 'debt_payoff' | 'retirement' | 'emergency' | 'custom'
  parameters: ScenarioParameters
  projections: ScenarioProjection[]
  created_date: Date
  active: boolean
}

export interface ScenarioParameters {
  initial_cost: number
  monthly_impact: number
  duration_months: number
  affected_categories: string[]
  income_change?: number
  interest_rate?: number
}

export interface ScenarioProjection {
  month: number
  projected_balance: number
  projected_income: number
  projected_expenses: number
  impact_on_goals: { [goalId: string]: number }
}

// Retirement Planning Types
export interface RetirementPlan {
  user_id: string
  current_age: number
  retirement_age: number
  current_savings: number
  monthly_contribution: number
  employer_match: number
  expected_return: number
  projected_balance: number
  replacement_ratio: number
  shortfall: number
  recommendations: string[]
}

export interface RetirementMilestone {
  age: number
  target_balance: number
  current_balance: number
  on_track: boolean
  years_ahead_behind: number
}

// Investment Matchmaker & Portfolio AI Types
export interface InvestmentGoal {
  id: string
  user_id: string
  title: string
  type: 'retirement' | 'house' | 'education' | 'emergency' | 'wealth_building' | 'custom'
  target_amount: number
  target_date: Date
  current_amount: number
  monthly_contribution: number
  priority: 'high' | 'medium' | 'low'
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  account_type: 'roth_ira' | 'traditional_ira' | '401k' | 'brokerage' | 'savings' | 'hsa'
  created_date: Date
  updated_date: Date
}

export interface RiskProfile {
  id: string
  user_id: string
  overall_score: number // 1-100
  category: 'conservative' | 'moderate' | 'aggressive'
  questionnaire_responses: RiskQuestionResponse[]
  behavioral_analysis: BehavioralRiskFactors
  confidence_score: number
  created_date: Date
  last_updated: Date
}

export interface RiskQuestionResponse {
  question_id: string
  question: string
  answer: string | number
  weight: number
}

export interface BehavioralRiskFactors {
  spending_volatility: number // How much spending varies month-to-month
  emergency_fund_ratio: number // Emergency fund / monthly expenses
  debt_to_income_ratio: number
  investment_experience_years: number
  age: number
  income_stability: number // 1-10 scale
}

export interface InvestmentRecommendation {
  id: string
  goal_id: string
  recommendation_type: 'etf' | 'mutual_fund' | 'individual_stock' | 'bond' | 'savings_account' | 'portfolio_mix'
  symbol: string
  name: string
  description: string
  allocation_percentage: number
  expected_annual_return: number
  expense_ratio: number
  risk_level: 'low' | 'medium' | 'high'
  reasoning: string
  confidence_score: number
  broker_links: BrokerLink[]
  created_date: Date
}

export interface BrokerLink {
  broker_name: string
  url: string
  has_commission: boolean
  minimum_investment: number
}

export interface PortfolioSimulation {
  id: string
  user_id: string
  goal_id: string
  simulation_type: 'monte_carlo' | 'historical' | 'scenario'
  initial_investment: number
  monthly_contribution: number
  time_horizon_years: number
  portfolio_allocation: AllocationMix
  results: SimulationResults
  created_date: Date
}

export interface AllocationMix {
  stocks_us: number
  stocks_international: number
  bonds: number
  real_estate: number
  commodities: number
  cash: number
}

export interface SimulationResults {
  probability_of_success: number // Chance of reaching goal
  median_outcome: number
  percentile_10: number // 10th percentile outcome (worst case)
  percentile_90: number // 90th percentile outcome (best case)
  monthly_projections: MonthlyProjection[]
  risk_metrics: RiskMetrics
}

export interface MonthlyProjection {
  month: number
  median_value: number
  percentile_10: number
  percentile_90: number
  probability_above_goal: number
}

export interface RiskMetrics {
  max_drawdown: number // Worst peak-to-trough decline
  volatility: number // Standard deviation of returns
  sharpe_ratio: number // Risk-adjusted return
  value_at_risk_5: number // 5% VaR
}

export interface RebalancingAlert {
  id: string
  user_id: string
  portfolio_id: string
  alert_type: 'overweight' | 'underweight' | 'drift' | 'opportunity'
  asset_class: string
  current_allocation: number
  target_allocation: number
  deviation_percentage: number
  suggested_action: string
  urgency: 'low' | 'medium' | 'high'
  potential_impact: string
  created_date: Date
  dismissed: boolean
}

export interface MarketData {
  symbol: string
  name: string
  current_price: number
  change_24h: number
  change_percentage_24h: number
  volume: number
  market_cap?: number
  pe_ratio?: number
  dividend_yield?: number
  expense_ratio?: number
  beta?: number
  last_updated: Date
}

export interface ETFData extends MarketData {
  category: string
  focus: string // e.g., "Large Cap", "Total Market", "International"
  inception_date: Date
  assets_under_management: number
  holdings_count: number
  top_holdings: Holding[]
}

export interface Holding {
  symbol: string
  name: string
  weight: number
}

export interface InvestmentEducation {
  id: string
  topic: string
  title: string
  content: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_read_time: number
  related_recommendations: string[]
  interactive_elements: EducationElement[]
}

export interface EducationElement {
  type: 'calculator' | 'chart' | 'quiz' | 'comparison'
  data: any
}

export interface InvestmentChatContext {
  user_goals: InvestmentGoal[]
  risk_profile: RiskProfile
  current_portfolio: Portfolio
  recent_recommendations: InvestmentRecommendation[]
  market_context: MarketData[]
} 