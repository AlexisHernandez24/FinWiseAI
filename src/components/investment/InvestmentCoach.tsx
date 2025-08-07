'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  TrendingUp,
  DollarSign,
  Target,
  Shield,
  Lightbulb,
  Clock,
  Sparkles
} from 'lucide-react'
import { InvestmentChatContext, InvestmentGoal, RiskProfile, Portfolio, InvestmentRecommendation } from '@/types/financial'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  context?: {
    recommendations?: InvestmentRecommendation[]
    calculations?: any
    charts?: any
  }
}

interface InvestmentCoachProps {
  chatContext: InvestmentChatContext
  onRecommendationSelect?: (recommendation: InvestmentRecommendation) => void
  className?: string
}

export function InvestmentCoach({ chatContext, onRecommendationSelect, className }: InvestmentCoachProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickTopics = [
    { id: 'roth_vs_brokerage', label: 'Roth IRA vs Brokerage', icon: <Target className="h-4 w-4" /> },
    { id: 'best_etfs', label: 'Best ETFs for beginners', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'risk_tolerance', label: 'Understanding risk', icon: <Shield className="h-4 w-4" /> },
    { id: 'rebalancing', label: 'When to rebalance', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'dollar_cost_averaging', label: 'Dollar-cost averaging', icon: <Clock className="h-4 w-4" /> },
    { id: 'tax_efficiency', label: 'Tax-efficient investing', icon: <Lightbulb className="h-4 w-4" /> }
  ]

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      addBotMessage(getWelcomeMessage())
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getWelcomeMessage = () => {
    const riskLevel = chatContext.risk_profile?.category || 'moderate'
    const goalsCount = chatContext.user_goals?.length || 0
    
    return `👋 Hi! I'm your AI Investment Coach. I can see you have a **${riskLevel}** risk profile${goalsCount > 0 ? ` and ${goalsCount} investment goal${goalsCount > 1 ? 's' : ''}` : ''}.

I'm here to help you with:
• Investment strategy and recommendations
• ETF and fund selection
• Risk management and portfolio allocation
• Tax optimization strategies
• Retirement planning insights

What would you like to discuss today?`
  }

  const addBotMessage = (content: string, context?: any) => {
    const newMessage: Message = {
      id: `bot_${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date(),
      context
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    addUserMessage(userMessage)
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateAIResponse(userMessage)
      addBotMessage(response.content, response.context)
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickTopic = (topicId: string) => {
    const topic = quickTopics.find(t => t.id === topicId)
    if (!topic) return

    setSelectedTopic(topicId)
    const question = getTopicQuestion(topicId)
    addUserMessage(question)
    setIsTyping(true)

    setTimeout(() => {
      const response = generateTopicResponse(topicId)
      addBotMessage(response.content, response.context)
      setIsTyping(false)
    }, 2000)
  }

  const getTopicQuestion = (topicId: string) => {
    switch (topicId) {
      case 'roth_vs_brokerage':
        return 'Should I prioritize my Roth IRA or taxable brokerage account?'
      case 'best_etfs':
        return 'What are the best ETFs for a beginner investor?'
      case 'risk_tolerance':
        return 'How do I determine my risk tolerance?'
      case 'rebalancing':
        return 'When and how should I rebalance my portfolio?'
      case 'dollar_cost_averaging':
        return 'Is dollar-cost averaging a good strategy?'
      case 'tax_efficiency':
        return 'How can I make my investments more tax-efficient?'
      default:
        return 'Tell me more about this topic.'
    }
  }

  const generateAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    // Pattern matching for common investment questions
    if (lowerMessage.includes('etf') || lowerMessage.includes('fund')) {
      return generateETFRecommendations()
    }
    
    if (lowerMessage.includes('roth') || lowerMessage.includes('401k') || lowerMessage.includes('ira')) {
      return generateRetirementAccountAdvice()
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('volatile')) {
      return generateRiskAdvice()
    }
    
    if (lowerMessage.includes('rebalance') || lowerMessage.includes('allocation')) {
      return generateRebalancingAdvice()
    }

    // Default response
    return {
      content: `That's a great question! Based on your ${chatContext.risk_profile?.category || 'moderate'} risk profile, here are some general insights:

💡 **Key Considerations:**
• Your time horizon affects risk tolerance
• Diversification is crucial for risk management
• Regular contributions often matter more than timing
• Tax-advantaged accounts should be prioritized

Would you like me to elaborate on any specific aspect of investing? I can provide more targeted advice if you share more details about your situation.`,
      context: null
    }
  }

  const generateTopicResponse = (topicId: string) => {
    switch (topicId) {
      case 'roth_vs_brokerage':
        return {
          content: `Great question! Here's how to prioritize between Roth IRA and taxable brokerage:

🎯 **Roth IRA First (Generally):**
• Tax-free growth and withdrawals in retirement
• $6,500 annual limit (2023) - maximize this first
• Perfect for long-term retirement savings
• No required minimum distributions

💼 **Then Brokerage Account:**
• Unlimited contribution capacity
• More investment flexibility
• Access to funds anytime (with tax implications)
• Good for goals before retirement age

**Your Strategy:** Max out Roth IRA first ($${(6500 / 12).toFixed(0)}/month), then overflow to brokerage for additional savings.`,
          context: null
        }

      case 'best_etfs':
        return generateETFRecommendations()

      case 'risk_tolerance':
        return {
          content: `Understanding your risk tolerance is crucial! Here's what I see from your profile:

📊 **Your Risk Assessment:** ${chatContext.risk_profile?.category.toUpperCase() || 'Not yet determined'}
${chatContext.risk_profile ? `Confidence Score: ${chatContext.risk_profile.confidence_score}%` : ''}

🔍 **Key Factors:**
• **Time Horizon:** Longer = more risk tolerance
• **Emotional Comfort:** Can you sleep at night during market drops?
• **Financial Cushion:** Emergency fund affects risk capacity
• **Life Stage:** Age and career stability matter

Your current profile suggests a **${chatContext.risk_profile?.category || 'balanced'}** approach with ${chatContext.risk_profile?.category === 'conservative' ? '40-60% stocks' : chatContext.risk_profile?.category === 'moderate' ? '60-80% stocks' : '80-90% stocks'}.`,
          context: null
        }

      case 'rebalancing':
        return generateRebalancingAdvice()

      case 'dollar_cost_averaging':
        return {
          content: `Dollar-cost averaging (DCA) is an excellent strategy, especially for beginners!

✅ **What is DCA?**
Investing a fixed amount regularly, regardless of market conditions.

🎯 **Benefits:**
• Reduces impact of market volatility
• Eliminates timing decisions
• Builds disciplined investing habits
• Often results in lower average cost per share

📈 **Perfect for You:**
With your ${chatContext.risk_profile?.category || 'moderate'} risk profile, DCA works great because:
• Consistent monthly investments smooth out market ups and downs
• You're already planning regular contributions
• Removes emotional decision-making

**Recommendation:** Set up automatic monthly investments into your chosen ETFs.`,
          context: null
        }

      case 'tax_efficiency':
        return {
          content: `Tax efficiency can significantly boost your long-term returns!

🏛️ **Account Priority (Tax Efficiency):**
1. **401k match** - Free money first
2. **Roth IRA** - Tax-free growth
3. **HSA** - Triple tax advantage (if available)
4. **Taxable brokerage** - Use tax-efficient funds

📋 **Tax-Efficient Strategies:**
• **Asset Location:** Bonds in tax-advantaged accounts, stocks in taxable
• **Index Funds/ETFs:** Lower turnover = fewer taxable events
• **Tax-Loss Harvesting:** Offset gains with losses
• **Hold periods:** >1 year for long-term capital gains rates

**For Your Portfolio:** Focus on broad market index ETFs like VTI/VOO in taxable accounts - they're very tax-efficient!`,
          context: null
        }

      default:
        return generateAIResponse('')
    }
  }

  const generateETFRecommendations = () => {
    const riskLevel = chatContext.risk_profile?.category || 'moderate'
    
    return {
      content: `Based on your **${riskLevel}** risk profile, here are my top ETF recommendations:

🥇 **Core Holdings (60-70% of portfolio):**
• **VTI** - Total Stock Market ETF (0.03% fee)
• **VOO** - S&P 500 ETF (0.03% fee)
*Choose one as your primary US holding*

🌍 **International Diversification (20-30%):**
• **VTIAX** - International developed & emerging markets
• **VXUS** - Total international stock ETF

🛡️ **Stability (10-20% based on risk level):**
• **BND** - Total Bond Market ETF
• **${riskLevel === 'conservative' ? 'VGSH - Short-term Treasury' : 'VGIT - Intermediate-term Treasury'}"

**Simple 3-Fund Portfolio:**
${riskLevel === 'conservative' ? '50% VTI, 20% VTIAX, 30% BND' : 
  riskLevel === 'moderate' ? '70% VTI, 20% VTIAX, 10% BND' : 
  '80% VTI, 20% VTIAX, 0% BND'}`,
      context: {
        recommendations: [] // Could populate with actual recommendation objects
      }
    }
  }

  const generateRetirementAccountAdvice = () => {
    return {
      content: `Let me break down retirement account strategy for you!

🎯 **Account Priority Order:**
1. **401k to employer match** (if available) - Free money!
2. **Roth IRA** - $6,500/year limit, tax-free growth
3. **Max 401k** - $22,500/year limit (2023)
4. **Taxable brokerage** - Unlimited, but taxable

💰 **Roth IRA Benefits:**
• Tax-free withdrawals in retirement
• No required minimum distributions
• Contributions can be withdrawn penalty-free
• Perfect for young investors

🏢 **401k Considerations:**
• Traditional vs Roth 401k choice
• Limited investment options
• Required minimum distributions at 73
• Higher contribution limits

**For your situation:** Start with Roth IRA if you're in a lower tax bracket now. As income grows, traditional 401k becomes more valuable.`,
      context: null
    }
  }

  const generateRiskAdvice = () => {
    const currentRisk = chatContext.risk_profile?.category || 'moderate'
    
    return {
      content: `Let's talk about risk management for your **${currentRisk}** profile!

⚖️ **Risk vs. Return Balance:**
Your current allocation should target:
${currentRisk === 'conservative' ? '• 40-60% stocks, 40-60% bonds\n• Expected return: 6-8% annually\n• Lower volatility, capital preservation focus' :
  currentRisk === 'moderate' ? '• 60-80% stocks, 20-40% bonds\n• Expected return: 8-10% annually\n• Balanced growth with some stability' :
  '• 80-100% stocks, 0-20% bonds\n• Expected return: 10-12% annually\n• Maximum growth potential, higher volatility'}

🛡️ **Risk Management Tips:**
• **Diversification:** Don't put all eggs in one basket
• **Time Horizon:** Longer timeline = can handle more risk
• **Emergency Fund:** 3-6 months expenses before investing
• **Regular Reviews:** Reassess annually or after major life changes

Remember: The biggest risk is not investing at all due to inflation!`,
      context: null
    }
  }

  const generateRebalancingAdvice = () => {
    return {
      content: `Rebalancing keeps your portfolio aligned with your goals! Here's my approach:

⏰ **When to Rebalance:**
• **Threshold method:** When any asset class drifts 5%+ from target
• **Calendar method:** Quarterly or annually
• **Combination:** Check quarterly, rebalance if needed

🔄 **How to Rebalance:**
1. **Check current allocation** vs target
2. **Identify overweight/underweight** positions  
3. **Sell high, buy low** - this is the magic!
4. **Use new contributions** to rebalance when possible

💡 **Smart Rebalancing Tips:**
• **Tax-advantaged accounts first** - No tax consequences
• **Use dividends/new money** before selling
• **Consider tax-loss harvesting** in taxable accounts
• **Don't rebalance too frequently** - costs money

**Current Status:** ${chatContext.current_portfolio ? 'I can see some drift in your portfolio that might benefit from rebalancing!' : 'Set up your target allocation first, then I can monitor drift for you.'}`,
      context: null
    }
  }

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to JSX
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|•.*|🎯.*|💡.*|✅.*|📊.*|🔍.*|🥇.*|🌍.*|🛡️.*|⚖️.*|⏰.*|🔄.*)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={index}>{part.slice(1, -1)}</em>
      }
      if (part.startsWith('•') || /^[🎯💡✅📊🔍🥇🌍🛡️⚖️⏰🔄]/.test(part)) {
        return <div key={index} className="my-1">{part}</div>
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>AI Investment Coach</span>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Powered by AI</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Get personalized investment advice and recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Topics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Topics:</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickTopics.map((topic) => (
              <Button
                key={topic.id}
                variant={selectedTopic === topic.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickTopic(topic.id)}
                className="justify-start text-xs h-8"
              >
                {topic.icon}
                <span className="ml-2 truncate">{topic.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="border rounded-lg h-96 overflow-y-auto p-4 space-y-4 bg-muted/20">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && (
                    <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {formatMessage(message.content)}
                  </div>
                </div>
                
                {message.context?.recommendations && (
                  <div className="mt-3 space-y-2">
                    {message.context.recommendations.map((rec: InvestmentRecommendation, idx: number) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => onRecommendationSelect?.(rec)}
                        className="w-full justify-start"
                      >
                        View {rec.name} Details
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me about investments, ETFs, risk tolerance..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Context Indicators */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span>
            Context: {chatContext.user_goals?.length || 0} goal{(chatContext.user_goals?.length || 0) !== 1 ? 's' : ''}, 
            {chatContext.risk_profile ? ` ${chatContext.risk_profile.category} risk profile` : ' no risk assessment'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
} 