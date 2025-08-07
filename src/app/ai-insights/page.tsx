'use client'

import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, Settings, AlertCircle, MessageCircle, Lightbulb, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { useApiStatus } from '@/hooks/useApiStatus'

export default function AIInsightsPage() {
  const { 
    accounts, 
    transactions, 
    goals, 
    insights, 
    portfolio,
    isGeneratingInsights, 
    generateInsights, 
    markInsightAsRead, 
    dismissInsight,
    getMonthlyExpenses,
    getNetWorth,
    getMonthlyIncome
  } = useFinancialStore()
  
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])

  const { plaid: plaidStatus, openai: openaiStatus } = useApiStatus()
  
  const hasFinancialData = accounts.length > 0 || transactions.length > 0
  const monthlyExpenses = getMonthlyExpenses()

  // Calculate AI confidence score based on data availability
  const calculateConfidenceScore = () => {
    let score = 0
    if (accounts.length > 0) score += 30
    if (transactions.length > 10) score += 40
    if (goals.length > 0) score += 20
    if (insights.length > 0) score += 10
    return Math.min(score, 100)
  }

  const confidenceScore = calculateConfidenceScore()

  // Generate spending analysis from transactions
  const getSpendingAnalysis = () => {
    if (transactions.length === 0) return []
    
    const categorySpending: { [key: string]: number } = {}
    transactions
      .filter(t => t.amount < 0)
      .forEach(transaction => {
        const category = transaction.category[0] || 'Other'
        categorySpending[category] = (categorySpending[category] || 0) + Math.abs(transaction.amount)
      })

    return Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
        percentage: monthlyExpenses > 0 ? Math.round((amount / monthlyExpenses) * 100) : 0
      }))
  }

  const spendingAnalysis = getSpendingAnalysis()

  const handleGenerateInsights = async () => {
    if (openaiStatus.connected && transactions.length > 0) {
      await generateInsights()
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !openaiStatus.connected) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      console.log('💬 Sending chat message to AI...')
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          financialContext: {
            accounts,
            transactions,
            netWorth: getNetWorth(),
            monthlyIncome: getMonthlyIncome(),
            monthlyExpenses: getMonthlyExpenses(),
            goals,
            portfolioValue: portfolio?.total_value || 0,
            topSpendingCategories: spendingAnalysis.slice(0, 3).map(item => item.category)
          },
          userId: 'user_001' // This should come from user context
        }),
      })

      const result = await response.json()
      console.log('📡 AI chat response:', result)

      if (result.success && result.response) {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.response
        }])
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I apologize, but I encountered an error while processing your request. Please try again.'
        }])
      }
    } catch (error) {
      console.error('❌ Error in AI chat:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error while processing your request. Please try again.'
      }])
    }
  }

  if (!hasFinancialData || !openaiStatus.connected) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-700 rounded-2xl"></div>
          <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
          <div className="relative p-8 lg:p-12 text-white">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-white" />
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <Lightbulb className="h-4 w-4" />
                <span>AI-Powered Financial Intelligence</span>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              AI Insights
            </h1>
            <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
              {!openaiStatus.connected 
                ? "Configure OpenAI API to unlock AI-powered financial insights and recommendations."
                : "Connect your accounts to enable personalized AI financial analysis."
              }
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200/50 text-center">
          <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Insights Not Available</h3>
          <p className="text-slate-600 mb-6">
            {!openaiStatus.connected 
              ? "Configure your OpenAI API to enable AI-powered financial insights and recommendations."
              : !plaidStatus.connected
              ? "Configure your Plaid API to connect accounts and enable AI analysis."
              : "Connect your financial accounts to start receiving AI insights."
            }
          </p>
          <div className="space-y-3 max-w-md mx-auto">
            {!openaiStatus.connected && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-700 font-medium">OpenAI API Required</p>
                    <p className="text-xs text-purple-600 mt-1">
                      Add your OPENAI_API_KEY to .env.local to enable AI insights.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!plaidStatus.connected && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Plaid API Required</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Add your Plaid API keys to .env.local to connect accounts.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        <div className="relative p-8 lg:p-12 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-white" />
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <Lightbulb className="h-4 w-4" />
                  <span>AI-Powered Financial Intelligence</span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  AI Financial Insights
                </h1>
                <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                  {insights.length > 0 
                    ? `Generated ${insights.length} personalized insights with ${confidenceScore}% confidence based on your financial data.`
                    : "Your AI assistant is ready to analyze your financial data and provide personalized recommendations."
                  }
                </p>
              </div>
              <div className="flex items-center space-x-6 text-white/80 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>{transactions.length} transactions analyzed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4 text-pink-400" />
                  <span>{insights.filter(i => !i.read).length} new insights</span>
                </div>
              </div>
            </div>
            
            {/* AI Confidence Meter */}
            <div className="hidden lg:block">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2"
                    strokeDasharray={`${confidenceScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{confidenceScore}%</p>
                    <p className="text-xs">Confidence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'AI Confidence', 
            value: `${confidenceScore}%`, 
            change: confidenceScore >= 80 ? 'High accuracy' : confidenceScore >= 50 ? 'Good data' : 'Need more data', 
            positive: confidenceScore >= 50, 
            icon: Brain 
          },
          { 
            label: 'Active Insights', 
            value: insights.length.toString(), 
            change: insights.filter(i => !i.read).length > 0 ? `${insights.filter(i => !i.read).length} new` : 'All read', 
            positive: insights.length > 0, 
            icon: Lightbulb 
          },
          { 
            label: 'Data Sources', 
            value: accounts.length.toString(), 
            change: accounts.length > 0 ? 'Connected accounts' : 'No accounts', 
            positive: accounts.length > 0, 
            icon: BarChart3 
          },
          { 
            label: 'Analysis Depth', 
            value: transactions.length > 50 ? 'Deep' : transactions.length > 20 ? 'Good' : 'Basic', 
            change: `${transactions.length} transactions`, 
            positive: transactions.length > 20, 
            icon: TrendingUp 
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${stat.positive ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'}`}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Insights and Analysis */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Personalized Recommendations */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Personalized Recommendations</h3>
              <button 
                onClick={handleGenerateInsights}
                disabled={isGeneratingInsights || !openaiStatus.connected}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
              >
                {isGeneratingInsights ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    <span>Generate Insights</span>
                  </>
                )}
              </button>
            </div>
            
            {insights.length > 0 ? (
              <div className="space-y-6">
                {insights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                      insight.read 
                        ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200' 
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md'
                    }`}
                  >
                    {/* Priority indicator bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      insight.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                      insight.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}></div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                            insight.priority === 'high' ? 'bg-gradient-to-br from-red-100 to-pink-100' :
                            insight.priority === 'medium' ? 'bg-gradient-to-br from-yellow-100 to-orange-100' :
                            'bg-gradient-to-br from-green-100 to-emerald-100'
                          }`}>
                            <span className="text-xl">
                              {insight.type === 'optimization' ? '⚡' :
                               insight.type === 'warning' ? '⚠️' :
                               insight.type === 'opportunity' ? '💡' :
                               '🎯'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-bold text-slate-900">{insight.title}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  insight.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                                  insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                  'bg-green-100 text-green-700 border border-green-200'
                                }`}>
                                  {insight.priority.toUpperCase()} PRIORITY
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                  {insight.confidence_score}% CONFIDENT
                                </span>
                              </div>
                            </div>
                            <div className="text-slate-700 leading-relaxed mb-4 space-y-3">
                              {insight.description.split('\n\n').map((paragraph, idx) => {
                                if (paragraph.startsWith('**Impact:**')) {
                                  return (
                                    <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                      <p className="font-semibold text-blue-900 mb-1">Impact</p>
                                      <p className="text-blue-800">{paragraph.replace('**Impact:**', '').trim()}</p>
                                    </div>
                                  )
                                } else if (paragraph.startsWith('**Action Items:**')) {
                                  return (
                                    <div key={idx} className="bg-green-50 rounded-lg p-3 border border-green-200">
                                      <p className="font-semibold text-green-900 mb-2">Action Items</p>
                                      <p className="text-green-800">{paragraph.replace('**Action Items:**', '').trim()}</p>
                                    </div>
                                  )
                                } else {
                                  return <p key={idx}>{paragraph}</p>
                                }
                              })}
                            </div>
                            
                            {insight.action_items && insight.action_items.length > 0 && (
                              <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <h5 className="font-semibold text-slate-900 mb-3 flex items-center">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                  Recommended Actions
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {insight.action_items.map((action, index) => (
                                    <div key={index} className="flex items-start space-x-2 p-2 bg-slate-50 rounded-lg">
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                      <span className="text-sm text-slate-700">{action}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!insight.read && (
                            <button
                              onClick={() => markInsightAsRead(insight.id)}
                              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => dismissInsight(insight.id)}
                            className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600 mb-3">No insights generated yet</p>
                <p className="text-sm text-slate-500">Click "Generate Insights" to analyze your financial data</p>
              </div>
            )}
          </div>

          {/* Spending Pattern Analysis */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Spending Pattern Analysis</h3>
            {spendingAnalysis.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendingAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No spending patterns available</p>
                  <p className="text-sm">Connect accounts to analyze spending</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          
          {/* AI Assistant Chat */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">AI Assistant Chat</h3>
            
            {openaiStatus.connected ? (
              <div className="space-y-4">
                <div className="h-64 bg-slate-50 rounded-lg p-4 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Ask me anything about your finances!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map((message, index) => (
                        <div 
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs p-3 rounded-lg text-sm ${
                            message.role === 'user' 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-white border border-slate-200 text-slate-700'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleChatSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your finances..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600 mb-3">AI Assistant unavailable</p>
                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                  Configure OpenAI API to enable chat
                </div>
              </div>
            )}
          </div>

          {/* Market Insights */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Market Insights</h3>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Market Opportunity</p>
                    <p className="text-xs text-green-700 mt-1">
                      Tech stocks showing strong momentum. Consider rebalancing your portfolio.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Interest Rate Alert</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Rising rates may affect your bond holdings. Review fixed-income allocation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Goal Update</p>
                    <p className="text-xs text-blue-700 mt-1">
                      You're on track to meet your emergency fund goal 2 months early.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleGenerateInsights}
                disabled={isGeneratingInsights || !openaiStatus.connected}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Brain className="h-4 w-4" />
                <span className="font-medium">Refresh Insights</span>
              </button>
              
              <button className="w-full bg-white border-2 border-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center justify-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Optimize Portfolio</span>
              </button>
              
              <button className="w-full bg-white border-2 border-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center justify-center space-x-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">Review Goals</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 