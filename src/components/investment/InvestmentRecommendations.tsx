'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  ExternalLink, 
  Info, 
  Target,
  DollarSign,
  Percent,
  Calendar,
  Award
} from 'lucide-react'
import { InvestmentRecommendation, InvestmentGoal, RiskProfile } from '@/types/financial'

interface InvestmentRecommendationsProps {
  recommendations: InvestmentRecommendation[]
  goal: InvestmentGoal
  riskProfile: RiskProfile
  onSelectRecommendation?: (recommendation: InvestmentRecommendation) => void
}

export function InvestmentRecommendations({ 
  recommendations, 
  goal, 
  riskProfile,
  onSelectRecommendation 
}: InvestmentRecommendationsProps) {
  const [selectedRec, setSelectedRec] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <Shield className="h-4 w-4 text-green-500" />
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-500" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateProjectedValue = (rec: InvestmentRecommendation) => {
    const monthlyContribution = goal.monthly_contribution * (rec.allocation_percentage / 100)
    const years = (goal.target_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)
    const months = years * 12
    
    // Simple compound interest calculation for projection
    const monthlyRate = rec.expected_annual_return / 12 / 100
    const futureValue = monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate)
    
    return futureValue
  }

  return (
    <div className="space-y-6">
      {/* Goal Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Investment Goal: {goal.title}</span>
          </CardTitle>
          <CardDescription>
            Target: {formatCurrency(goal.target_amount)} by {goal.target_date.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(goal.current_amount)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Monthly Contribution</p>
              <p className="text-lg font-semibold">{formatCurrency(goal.monthly_contribution)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Risk Profile</p>
              <p className="text-lg font-semibold capitalize">{riskProfile.category}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="text-lg font-semibold">{goal.account_type.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">AI-Powered Recommendations</h3>
        
        {recommendations.map((rec, index) => (
          <Card 
            key={rec.id} 
            className={`transition-all duration-200 hover:shadow-lg ${
              selectedRec === rec.id ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                    <span>{rec.name} ({rec.symbol})</span>
                    <Badge className={getRiskColor(rec.risk_level)}>
                      {getRiskIcon(rec.risk_level)}
                      <span className="ml-1">{rec.risk_level} risk</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {rec.description}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{rec.confidence_score}% confidence</span>
                  </div>
                  <Progress value={rec.confidence_score} className="w-20 mt-1" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <Percent className="h-4 w-4 mx-auto text-green-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Allocation</p>
                  <p className="font-semibold">{rec.allocation_percentage}%</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Expected Return</p>
                  <p className="font-semibold">{rec.expected_annual_return}%</p>
                </div>
                <div className="text-center">
                  <DollarSign className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Expense Ratio</p>
                  <p className="font-semibold">{(rec.expense_ratio * 100).toFixed(2)}%</p>
                </div>
                <div className="text-center">
                  <Calendar className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Projected Value</p>
                  <p className="font-semibold">{formatCurrency(calculateProjectedValue(rec))}</p>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Why This Investment?</h4>
                    <p className="text-sm text-blue-800">{rec.reasoning}</p>
                  </div>
                </div>
              </div>

              {/* Broker Links */}
              {rec.broker_links && rec.broker_links.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Where to Invest:</h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.broker_links.map((broker, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(broker.url, '_blank')}
                        className="flex items-center space-x-1"
                      >
                        <span>{broker.broker_name}</span>
                        <ExternalLink className="h-3 w-3" />
                        {!broker.has_commission && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            No fees
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant={selectedRec === rec.id ? "default" : "outline"}
                  onClick={() => {
                    setSelectedRec(selectedRec === rec.id ? null : rec.id)
                    if (onSelectRecommendation) {
                      onSelectRecommendation(rec)
                    }
                  }}
                  className="flex-1"
                >
                  {selectedRec === rec.id ? 'Selected' : 'Select This Investment'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(showDetails === rec.id ? null : rec.id)}
                >
                  {showDetails === rec.id ? 'Less Details' : 'More Details'}
                </Button>
              </div>

              {/* Detailed Information */}
              {showDetails === rec.id && (
                <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-muted">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium">Investment Type:</h5>
                      <p className="text-sm text-muted-foreground capitalize">
                        {rec.recommendation_type.replace('_', ' ')}
                      </p>
                    </div>
                    
                    {rec.broker_links && rec.broker_links.length > 0 && (
                      <div>
                        <h5 className="font-medium">Minimum Investment:</h5>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(Math.min(...rec.broker_links.map(b => b.minimum_investment)))}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="font-medium">Best For:</h5>
                      <p className="text-sm text-muted-foreground">
                        {goal.type === 'retirement' && 'Long-term retirement savings with tax advantages'}
                        {goal.type === 'house' && 'Medium-term savings with capital preservation'}
                        {goal.type === 'emergency' && 'Immediate liquidity and capital safety'}
                        {goal.type === 'wealth_building' && 'Long-term wealth accumulation and growth'}
                        {goal.type === 'education' && 'Education savings with moderate growth potential'}
                        {goal.type === 'custom' && 'Custom investment goals and timeline'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recommendations Available</h3>
            <p className="text-muted-foreground">
              Complete your risk assessment to receive personalized investment recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 