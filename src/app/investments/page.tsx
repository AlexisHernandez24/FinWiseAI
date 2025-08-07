'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  MessageSquare,
  Plus,
  Sparkles,
  Calculator,
  AlertTriangle,
  Shield
} from 'lucide-react'
import { RiskAssessment } from '@/components/investment/RiskAssessment'
import { InvestmentRecommendations } from '@/components/investment/InvestmentRecommendations'
import { PortfolioSimulationComponent } from '@/components/investment/PortfolioSimulation'
import { RebalancingAlerts } from '@/components/investment/RebalancingAlerts'
import { InvestmentCoach } from '@/components/investment/InvestmentCoach'
import { useFinancialStore } from '@/store/financialStore'
import { investmentMatchmaker } from '@/lib/investmentMatchmaker'
import { 
  InvestmentGoal, 
  RiskProfile, 
  InvestmentRecommendation, 
  BehavioralRiskFactors,
  AllocationMix,
  InvestmentChatContext
} from '@/types/financial'

export default function InvestmentsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [currentGoal, setCurrentGoal] = useState<InvestmentGoal | null>(null)
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([])
  const [showRiskAssessment, setShowRiskAssessment] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)

  const { user, connectedInstitutions, portfolio, transactions } = useFinancialStore()

  useEffect(() => {
    // Check if user has existing risk profile or investment goals
    // This would typically come from the store or API
  }, [])

  const handleRiskAssessmentComplete = async (profile: RiskProfile) => {
    setRiskProfile(profile)
    setShowRiskAssessment(false)
    
    // If we have a goal, generate recommendations
    if (currentGoal) {
      const recs = await investmentMatchmaker.generateRecommendations(currentGoal, profile)
      setRecommendations(recs)
    }
  }

  const createSampleGoal = (type: 'retirement' | 'house' | 'emergency') => {
    const goals = {
      retirement: {
        id: `goal_${Date.now()}`,
        user_id: user?.id || '',
        title: 'Retirement Savings',
        type: 'retirement' as const,
        target_amount: 1000000,
        target_date: new Date(Date.now() + 30 * 365 * 24 * 60 * 60 * 1000), // 30 years
        current_amount: 50000,
        monthly_contribution: 1000,
        priority: 'high' as const,
        risk_tolerance: 'moderate' as const,
        account_type: 'roth_ira' as const,
        created_date: new Date(),
        updated_date: new Date()
      },
      house: {
        id: `goal_${Date.now()}`,
        user_id: user?.id || '',
        title: 'House Down Payment',
        type: 'house' as const,
        target_amount: 100000,
        target_date: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years
        current_amount: 15000,
        monthly_contribution: 1500,
        priority: 'high' as const,
        risk_tolerance: 'moderate' as const,
        account_type: 'brokerage' as const,
        created_date: new Date(),
        updated_date: new Date()
      },
      emergency: {
        id: `goal_${Date.now()}`,
        user_id: user?.id || '',
        title: 'Emergency Fund',
        type: 'emergency' as const,
        target_amount: 30000,
        target_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
        current_amount: 5000,
        monthly_contribution: 1000,
        priority: 'high' as const,
        risk_tolerance: 'conservative' as const,
        account_type: 'savings' as const,
        created_date: new Date(),
        updated_date: new Date()
      }
    }
    
    setCurrentGoal(goals[type])
  }

  const getBehavioralFactors = (): BehavioralRiskFactors => {
    // Calculate behavioral factors from user's financial data
    const monthlyExpenses = useFinancialStore.getState().getMonthlyExpenses()
    const monthlyIncome = useFinancialStore.getState().getMonthlyIncome()
    const netWorth = useFinancialStore.getState().getNetWorth()
    
    return {
      spending_volatility: 0.15, // Calculate from transaction variance
      emergency_fund_ratio: netWorth > 0 ? Math.min(6, netWorth / (monthlyExpenses * 6)) : 0,
      debt_to_income_ratio: Math.max(0, Math.min(1, -monthlyExpenses / Math.max(monthlyIncome, 1))),
      investment_experience_years: 3, // This could come from user profile
      age: 35, // This could come from user profile
      income_stability: 7 // This could be calculated or user-provided
    }
  }

  const getTargetAllocation = (): AllocationMix => {
    if (!riskProfile) {
      return {
        stocks_us: 60,
        stocks_international: 20,
        bonds: 15,
        real_estate: 3,
        commodities: 1,
        cash: 1
      }
    }

    if (riskProfile.category === 'conservative') {
      return {
        stocks_us: 40,
        stocks_international: 10,
        bonds: 45,
        real_estate: 3,
        commodities: 1,
        cash: 1
      }
    } else if (riskProfile.category === 'moderate') {
      return {
        stocks_us: 60,
        stocks_international: 20,
        bonds: 15,
        real_estate: 3,
        commodities: 1,
        cash: 1
      }
    } else {
      return {
        stocks_us: 70,
        stocks_international: 25,
        bonds: 2,
        real_estate: 2,
        commodities: 1,
        cash: 0
      }
    }
  }

  const getChatContext = (): InvestmentChatContext => {
    return {
      user_goals: currentGoal ? [currentGoal] : [],
      risk_profile: riskProfile!,
      current_portfolio: portfolio!,
      recent_recommendations: recommendations,
      market_context: [] // This would come from market data API
    }
  }

  const isSetupComplete = Boolean(user && riskProfile && currentGoal)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Investment Matchmaker</h1>
            <p className="text-blue-100 text-lg">
              Personalized investment recommendations powered by advanced AI
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Beta
            </Badge>
          </div>
        </div>
      </div>

      {/* Setup Flow */}
      {!isSetupComplete && (
        <Card className="border-2 border-dashed border-muted">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Get Started with AI Investment Recommendations</span>
            </CardTitle>
            <CardDescription>
              Complete these steps to receive personalized investment advice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: User Profile */}
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {user ? '✓' : '1'}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">User Profile</h3>
                <p className="text-sm text-muted-foreground">
                  {user ? `Welcome, ${user.name}!` : 'Set up your profile'}
                </p>
              </div>
            </div>

            {/* Step 2: Investment Goal */}
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentGoal ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {currentGoal ? '✓' : '2'}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Investment Goal</h3>
                <p className="text-sm text-muted-foreground">
                  {currentGoal ? `Goal: ${currentGoal.title}` : 'Choose your investment objective'}
                </p>
              </div>
              {!currentGoal && (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => createSampleGoal('retirement')}>
                    Retirement
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => createSampleGoal('house')}>
                    House
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => createSampleGoal('emergency')}>
                    Emergency
                  </Button>
                </div>
              )}
            </div>

            {/* Step 3: Risk Assessment */}
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${riskProfile ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {riskProfile ? '✓' : '3'}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Risk Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  {riskProfile ? `Risk Level: ${riskProfile.category}` : 'Determine your risk tolerance'}
                </p>
              </div>
              {!riskProfile && currentGoal && (
                <Button size="sm" onClick={() => setShowRiskAssessment(true)}>
                  Take Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment Modal */}
      {showRiskAssessment && currentGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <RiskAssessment
              onComplete={handleRiskAssessmentComplete}
              userId={user?.id || ''}
              behavioralFactors={getBehavioralFactors()}
            />
            <Button
              variant="outline"
              onClick={() => setShowRiskAssessment(false)}
              className="mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isSetupComplete && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Simulation</span>
            </TabsTrigger>
            <TabsTrigger value="rebalancing" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Rebalancing</span>
            </TabsTrigger>
            <TabsTrigger value="coach" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>AI Coach</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Risk Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <Badge className="text-lg px-4 py-2 capitalize">
                      {riskProfile?.category}
                    </Badge>
                    <p className="text-2xl font-bold">{riskProfile?.overall_score}/100</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {riskProfile?.confidence_score}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Active Goal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-medium">{currentGoal?.title}</h3>
                    <p className="text-2xl font-bold">
                      ${currentGoal?.target_amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Target: {currentGoal?.target_date.toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations Count */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold">{recommendations.length}</p>
                    <p className="text-sm text-muted-foreground">
                      AI-generated suggestions
                    </p>
                    <Button size="sm" onClick={() => setActiveTab('recommendations')}>
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {currentGoal && riskProfile && (
              <InvestmentRecommendations
                recommendations={recommendations}
                goal={currentGoal}
                riskProfile={riskProfile}
              />
            )}
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            {currentGoal && (
              <PortfolioSimulationComponent
                goal={currentGoal}
                allocation={getTargetAllocation()}
              />
            )}
          </TabsContent>

          <TabsContent value="rebalancing" className="space-y-6">
            {portfolio && (
              <RebalancingAlerts
                portfolio={portfolio}
              />
            )}
          </TabsContent>

          <TabsContent value="coach" className="space-y-6">
            {riskProfile && (
              <InvestmentCoach
                chatContext={getChatContext()}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 