'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Scale,
  CheckCircle,
  Clock,
  Info,
  ArrowRight,
  BarChart3
} from 'lucide-react'
import { RebalancingAlert, Portfolio, AllocationMix } from '@/types/financial'
import { investmentMatchmaker } from '@/lib/investmentMatchmaker'

interface RebalancingAlertsProps {
  portfolio: Portfolio
  onRebalance?: (alert: RebalancingAlert) => void
  className?: string
}

export function RebalancingAlerts({ portfolio, onRebalance, className }: RebalancingAlertsProps) {
  const [alerts, setAlerts] = useState<RebalancingAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [showAllAlerts, setShowAllAlerts] = useState(false)

  useEffect(() => {
    generateAlerts()
  }, [portfolio])

  const generateAlerts = () => {
    if (!portfolio.target_allocation || !portfolio.asset_allocation) return

    const newAlerts = investmentMatchmaker.generateRebalancingAlerts(
      portfolio.asset_allocation,
      portfolio.target_allocation,
      portfolio.rebalancing_threshold || 5
    )

    // Set user and portfolio IDs
    newAlerts.forEach(alert => {
      alert.user_id = portfolio.user_id
      alert.portfolio_id = portfolio.id
    })

    setAlerts(newAlerts)
  }

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...Array.from(prev), alertId]))
  }

  const handleRebalanceAction = (alert: RebalancingAlert) => {
    if (onRebalance) {
      onRebalance(alert)
    }
    handleDismissAlert(alert.id)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'low': return <Info className="h-4 w-4 text-blue-600" />
      default: return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'overweight': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'underweight': return <TrendingDown className="h-4 w-4 text-blue-500" />
      case 'drift': return <Scale className="h-4 w-4 text-yellow-500" />
      case 'opportunity': return <BarChart3 className="h-4 w-4 text-green-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const formatAssetClass = (assetClass: string) => {
    return assetClass.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id))
  const displayAlerts = showAllAlerts ? visibleAlerts : visibleAlerts.slice(0, 3)

  const portfolioBalance = Object.values(portfolio.asset_allocation).reduce((sum, value) => sum + value, 0)
  const isBalanced = Math.abs(portfolioBalance - 100) < 1 // Within 1% of 100%

  if (visibleAlerts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Portfolio Balanced</span>
          </CardTitle>
          <CardDescription>
            Your portfolio allocation is within target ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Scale className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">All Good!</h3>
              <p className="text-green-700">
                No rebalancing needed at this time. Your portfolio is well-aligned with your target allocation.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Last rebalance: {portfolio.last_rebalance_date.toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Rebalancing Alerts</span>
              <Badge variant="secondary">{visibleAlerts.length}</Badge>
            </CardTitle>
            <CardDescription>
              AI-detected portfolio drift and rebalancing opportunities
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={generateAlerts}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Portfolio Balance Status */}
        <div className={`p-4 rounded-lg border ${isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isBalanced ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${isBalanced ? 'text-green-900' : 'text-red-900'}`}>
                Portfolio Balance: {portfolioBalance.toFixed(1)}%
              </span>
            </div>
            <span className={`text-sm ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
              {isBalanced ? 'Balanced' : 'Needs Attention'}
            </span>
          </div>
        </div>

        {/* Rebalancing Alerts */}
        <div className="space-y-3">
          {displayAlerts.map((alert) => (
            <Card key={alert.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    {getAlertTypeIcon(alert.alert_type)}
                    <span className="font-medium">{formatAssetClass(alert.asset_class)}</span>
                    <Badge className={getUrgencyColor(alert.urgency)}>
                      {getUrgencyIcon(alert.urgency)}
                      <span className="ml-1 capitalize">{alert.urgency}</span>
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {alert.deviation_percentage.toFixed(1)}% drift
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Current vs Target Allocation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={alert.current_allocation} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{alert.current_allocation.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={alert.target_allocation} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{alert.target_allocation.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Suggestion */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-1">Suggested Action:</h4>
                    <p className="text-sm text-blue-800">{alert.suggested_action}</p>
                  </div>

                  {/* Potential Impact */}
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-1">Potential Impact:</h4>
                    <p className="text-sm text-green-800">{alert.potential_impact}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={() => handleRebalanceAction(alert)}
                      className="flex-1"
                      size="sm"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Apply Rebalancing
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDismissAlert(alert.id)}
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More/Less Button */}
        {visibleAlerts.length > 3 && (
          <Button
            variant="ghost"
            onClick={() => setShowAllAlerts(!showAllAlerts)}
            className="w-full"
          >
            {showAllAlerts ? (
              <>Show Less ({visibleAlerts.length - 3} hidden)</>
            ) : (
              <>Show All Alerts ({visibleAlerts.length - 3} more)</>
            )}
          </Button>
        )}

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-3">Rebalancing Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.urgency === 'high').length}
              </p>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.urgency === 'medium').length}
              </p>
              <p className="text-xs text-muted-foreground">Medium Priority</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {alerts.filter(a => a.urgency === 'low').length}
              </p>
              <p className="text-xs text-muted-foreground">Low Priority</p>
            </div>
          </div>
        </div>

        {/* Educational Note */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Why Rebalance?</h4>
              <p className="text-sm text-blue-800">
                Regular rebalancing helps maintain your target risk level and can improve long-term returns by selling high-performing assets and buying underperforming ones.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 