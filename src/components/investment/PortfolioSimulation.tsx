'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Target,
  Calculator,
  BarChart3,
  RefreshCw,
  Info,
  DollarSign
} from 'lucide-react'
import { PortfolioSimulation, InvestmentGoal, AllocationMix, SimulationResults } from '@/types/financial'
import { investmentMatchmaker } from '@/lib/investmentMatchmaker'

interface PortfolioSimulationProps {
  goal: InvestmentGoal
  allocation: AllocationMix
  onSimulationComplete?: (simulation: PortfolioSimulation) => void
}

export function PortfolioSimulationComponent({ 
  goal, 
  allocation, 
  onSimulationComplete 
}: PortfolioSimulationProps) {
  const [simulation, setSimulation] = useState<PortfolioSimulation | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<'median' | 'optimistic' | 'pessimistic'>('median')

  const timeHorizonYears = (goal.target_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)

  useEffect(() => {
    runSimulation()
  }, [goal, allocation])

  const runSimulation = async () => {
    setIsRunning(true)
    try {
      const result = await investmentMatchmaker.runPortfolioSimulation(
        goal,
        allocation,
        goal.monthly_contribution,
        timeHorizonYears
      )
      result.user_id = goal.user_id || ''
      setSimulation(result)
      if (onSimulationComplete) {
        onSimulationComplete(result)
      }
    } catch (error) {
      console.error('Simulation failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getSuccessColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-600'
    if (probability >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSuccessIcon = (probability: number) => {
    if (probability >= 0.8) return <TrendingUp className="h-5 w-5 text-green-600" />
    if (probability >= 0.6) return <BarChart3 className="h-5 w-5 text-yellow-600" />
    return <TrendingDown className="h-5 w-5 text-red-600" />
  }

  const prepareChartData = () => {
    if (!simulation) return []
    
    return simulation.results.monthly_projections.map(projection => ({
      month: projection.month,
      year: Math.floor(projection.month / 12),
      median: projection.median_value,
      optimistic: projection.percentile_90,
      pessimistic: projection.percentile_10,
      target: goal.target_amount
    }))
  }

  const getScenarioData = () => {
    const chartData = prepareChartData()
    return chartData.map(data => ({
      ...data,
      value: data[selectedScenario]
    }))
  }

  if (!simulation && !isRunning) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Portfolio Simulation</span>
          </CardTitle>
          <CardDescription>
            Run Monte Carlo simulation to see projected outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runSimulation} className="w-full">
            Run Simulation
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isRunning) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">Running Simulation</h3>
          <p className="text-muted-foreground text-center">
            Analyzing 1,000 market scenarios to project your portfolio performance...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Simulation Results</span>
              </CardTitle>
              <CardDescription>
                Based on 1,000 Monte Carlo simulations over {timeHorizonYears.toFixed(1)} years
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={runSimulation}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-run
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Success Probability */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              {getSuccessIcon(simulation!.results.probability_of_success)}
              <h3 className="text-2xl font-bold mt-2 mb-1">
                {(simulation!.results.probability_of_success * 100).toFixed(0)}%
              </h3>
              <p className="text-sm text-muted-foreground">Chance of Success</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reaching {formatCurrency(goal.target_amount)}
              </p>
            </div>

            {/* Median Outcome */}
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <DollarSign className="h-5 w-5 text-green-600 mx-auto" />
              <h3 className="text-2xl font-bold mt-2 mb-1">
                {formatCurrency(simulation!.results.median_outcome)}
              </h3>
              <p className="text-sm text-muted-foreground">Expected Value</p>
              <p className="text-xs text-muted-foreground mt-1">
                50% chance of reaching this amount
              </p>
            </div>

            {/* Risk Metrics */}
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto" />
              <h3 className="text-2xl font-bold mt-2 mb-1">
                {(simulation!.results.risk_metrics.max_drawdown * 100).toFixed(1)}%
              </h3>
              <p className="text-sm text-muted-foreground">Max Drawdown</p>
              <p className="text-xs text-muted-foreground mt-1">
                Worst potential decline
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome Range */}
      <Card>
        <CardHeader>
          <CardTitle>Outcome Range</CardTitle>
          <CardDescription>
            Potential portfolio values at your target date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h4 className="font-medium text-red-900">Pessimistic (10th percentile)</h4>
                <p className="text-sm text-red-700">Only 10% chance of doing worse</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-900">
                  {formatCurrency(simulation!.results.percentile_10)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-medium text-blue-900">Expected (50th percentile)</h4>
                <p className="text-sm text-blue-700">Most likely outcome</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(simulation!.results.median_outcome)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-medium text-green-900">Optimistic (90th percentile)</h4>
                <p className="text-sm text-green-700">10% chance of doing better</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(simulation!.results.percentile_90)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Portfolio Growth Projection</CardTitle>
              <CardDescription>
                How your portfolio might grow over time
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {(['pessimistic', 'median', 'optimistic'] as const).map((scenario) => (
                <Button
                  key={scenario}
                  variant={selectedScenario === scenario ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedScenario(scenario)}
                  className="capitalize"
                >
                  {scenario}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getScenarioData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Years', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                  labelFormatter={(year) => `Year ${year}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center mt-4 space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Portfolio Value</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-1 bg-red-500"></div>
              <span>Target Amount</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Risk Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Volatility</h4>
              <p className="text-2xl font-bold">
                {(simulation!.results.risk_metrics.volatility * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Annual volatility</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Sharpe Ratio</h4>
              <p className="text-2xl font-bold">
                {simulation!.results.risk_metrics.sharpe_ratio.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Value at Risk</h4>
              <p className="text-2xl font-bold">
                {formatCurrency(simulation!.results.risk_metrics.value_at_risk_5)}
              </p>
              <p className="text-xs text-muted-foreground">5% VaR</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Max Drawdown</h4>
              <p className="text-2xl font-bold">
                {(simulation!.results.risk_metrics.max_drawdown * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Worst decline</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interpretation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Info className="h-5 w-5" />
            <span>What This Means</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-800">
            <p>
              <strong>Success Rate:</strong> There's a {(simulation!.results.probability_of_success * 100).toFixed(0)}% 
              chance you'll reach your target of {formatCurrency(goal.target_amount)}.
            </p>
            <p>
              <strong>Expected Outcome:</strong> You're most likely to end up with around {formatCurrency(simulation!.results.median_outcome)}, 
              which is {simulation!.results.median_outcome > goal.target_amount ? 'above' : 'below'} your target.
            </p>
            <p>
              <strong>Risk Consideration:</strong> In the worst-case scenario (bottom 10%), 
              you might only reach {formatCurrency(simulation!.results.percentile_10)}.
            </p>
            {simulation!.results.probability_of_success < 0.7 && (
              <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="font-medium text-yellow-900">💡 Suggestion:</p>
                <p className="text-yellow-800">
                  Consider increasing your monthly contribution or adjusting your timeline to improve your chances of success.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 