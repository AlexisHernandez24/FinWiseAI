/**
 * OpenAI Service - AI-Powered Financial Intelligence
 * 
 * This service handles all interactions with OpenAI's GPT models to provide
 * intelligent financial insights, spending analysis, and personalized recommendations.
 * It processes financial data and generates actionable insights using natural language.
 * 
 * Key responsibilities:
 * - Financial data analysis and insight generation
 * - Spending pattern recognition and categorization
 * - Goal-based recommendations and progress tracking
 * - Budget optimization suggestions
 * - Natural language financial coaching
 * - Portfolio analysis and investment advice
 */

import OpenAI from 'openai'
import { Transaction, FinancialGoal, AIInsight, SpendingPattern, Portfolio, APIResponse } from '@/types/financial'

/**
 * OpenAIService Class
 * 
 * Manages all OpenAI API interactions for AI-powered financial insights.
 * Provides methods for analyzing financial data, generating recommendations,
 * and offering personalized financial advice through natural language processing.
 */
class OpenAIService {
  private client: OpenAI | null = null
  private isConfigured: boolean = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize or re-initialize the OpenAI service
   * 
   * Sets up the OpenAI API client with environment variables.
   * Checks for proper configuration and logs status for debugging.
   */
  private initialize() {
    const apiKey = process.env.OPENAI_API_KEY
    
    // Debug logging to verify environment variable
    console.log('OpenAIService Environment Check:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length,
      keyStart: apiKey?.substring(0, 10) + '...'
    })
    
    if (apiKey && apiKey.length > 10) {
      this.client = new OpenAI({
        apiKey: apiKey,
      })
      this.isConfigured = true
    }
  }

  /**
   * Force re-initialization of the service
   * 
   * Useful for client-side updates or when environment variables change.
   */
  reinitialize() {
    this.initialize()
  }

  /**
   * Check if OpenAI is properly configured and connected
   * 
   * @returns boolean - True if service is ready for API calls
   */
  isConnected(): boolean {
    return this.isConfigured && this.client !== null
  }

  /**
   * Generate comprehensive financial insights based on user data
   * 
   * Analyzes transaction history, financial goals, and portfolio data to
   * generate personalized insights and recommendations using AI.
   * 
   * @param transactions - User's transaction history
   * @param goals - User's financial goals
   * @param portfolio - User's investment portfolio (optional)
   * @param userId - User identifier for personalization
   * @returns Promise<APIResponse> - AI insights or error response
   */
  async generateFinancialInsights(
    transactions: Transaction[],
    goals: FinancialGoal[],
    portfolio?: Portfolio,
    userId: string = 'user'
  ): Promise<APIResponse<AIInsight[]>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'OpenAI API is not configured. Please add your OPENAI_API_KEY to .env.local to enable AI insights.'
      }
    }

    if (transactions.length === 0) {
      return {
        success: false,
        error: 'No transaction data available. Connect your bank accounts to generate AI insights.'
      }
    }

    try {
      // Analyze financial data to create context for AI
      const financialSummary = this.analyzeFinancialData(transactions, goals, portfolio)
      
      // Create comprehensive prompt for AI analysis
      const prompt = `
        Analyze the following financial data and provide 3-5 personalized insights and recommendations:

        Financial Summary:
        - Monthly Income: $${financialSummary.monthlyIncome}
        - Monthly Expenses: $${financialSummary.monthlyExpenses}
        - Savings Rate: ${financialSummary.savingsRate}%
        - Top Spending Categories: ${financialSummary.topCategories.join(', ')}
        - Active Goals: ${goals.length}
        - Portfolio Value: $${portfolio?.total_value || 0}

        Recent Spending Patterns:
        ${financialSummary.spendingInsights}

        Please provide insights in the following format for each recommendation:
        1. Type: [optimization/warning/opportunity/goal_progress]
        2. Priority: [high/medium/low]
        3. Title: [Brief, descriptive title]
        4. Description: [Detailed explanation of the insight - 2-3 sentences]
        5. Impact: [Expected financial impact - be specific about potential benefits]
        6. Action Items: [2-3 specific, actionable steps separated by periods]
        7. Confidence: [Confidence score 1-100]

        Important formatting requirements:
        - Provide complete sentences and thoughts - do not truncate mid-sentence
        - Make each section comprehensive and actionable
        - Ensure descriptions are 2-3 sentences minimum
        - Action items should be specific steps the user can take
        - Impact should clearly explain the financial benefit

        Focus on actionable advice that can help improve their financial situation.
      `

      // Call OpenAI API for insights generation
      const response = await this.client!.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor with expertise in personal finance, budgeting, and investment strategies. Provide clear, actionable advice based on the user\'s financial data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content || ''
      
      // Parse AI response into structured insights
      const insights = this.parseAIResponse(content, userId)
      
      return {
        success: true,
        data: insights
      }
    } catch (error: any) {
      console.error('Error generating financial insights:', error)
      return {
        success: false,
        error: error.message || 'Failed to generate financial insights'
      }
    }
  }

  /**
   * Analyze spending patterns using AI
   * 
   * Uses AI to identify spending trends, categorize expenses, and provide
   * insights about spending behavior and optimization opportunities.
   * 
   * @param transactions - Transaction history to analyze
   * @param userId - User identifier
   * @returns Promise<APIResponse> - Spending patterns analysis
   */
  async analyzeSpendingPatterns(transactions: Transaction[], userId: string): Promise<APIResponse<SpendingPattern[]>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'OpenAI API is not configured. Please add your OPENAI_API_KEY to .env.local'
      }
    }

    if (transactions.length === 0) {
      return {
        success: false,
        error: 'No transaction data available for analysis.'
      }
    }

    try {
      // Categorize transactions for analysis
      const categoryTotals = this.categorizeTransactions(transactions)
      
      const prompt = `
        Analyze the following spending data and identify key patterns and insights:

        Spending by Category:
        ${Object.entries(categoryTotals)
          .sort(([,a], [,b]) => b - a)
          .map(([category, amount]) => `${category}: $${amount.toFixed(2)}`)
          .join('\n')}

        Total Transactions: ${transactions.length}
        Date Range: ${new Date(Math.min(...transactions.map(t => new Date(t.date).getTime()))).toLocaleDateString()} to ${new Date(Math.max(...transactions.map(t => new Date(t.date).getTime()))).toLocaleDateString()}

        Please identify:
        1. Spending trends and patterns
        2. Categories with unusual spending
        3. Opportunities for cost reduction
        4. Seasonal spending patterns
        5. Recommendations for budget optimization

        Format each pattern as:
        - Pattern: [Description of the pattern]
        - Impact: [Financial impact or significance]
        - Recommendation: [Actionable advice]
        - Confidence: [1-100 confidence score]
      `

      const response = await this.client!.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst specializing in spending pattern analysis. Provide clear insights about spending behavior and optimization opportunities.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content || ''
      const patterns = this.parseSpendingPatterns(content, categoryTotals)
      
      return {
        success: true,
        data: patterns
      }
    } catch (error: any) {
      console.error('Error analyzing spending patterns:', error)
      return {
        success: false,
        error: error.message || 'Failed to analyze spending patterns'
      }
    }
  }

  /**
   * Generate goal-specific recommendations
   * 
   * Analyzes a specific financial goal and provides personalized recommendations
   * for achieving it based on current financial situation.
   * 
   * @param goal - Financial goal to analyze
   * @param userFinancialData - User's current financial data
   * @returns Promise<APIResponse> - Goal-specific recommendations
   */
  async generateGoalRecommendations(goal: FinancialGoal, userFinancialData: any): Promise<APIResponse<string[]>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'OpenAI API is not configured. Please add your OPENAI_API_KEY to .env.local'
      }
    }

    try {
      const prompt = `
        Analyze this financial goal and provide specific recommendations for achieving it:

        Goal: ${goal.title}
        Type: ${goal.type}
        Target Amount: $${goal.target_amount}
        Current Amount: $${goal.current_amount}
        Target Date: ${goal.target_date}
        Priority: ${goal.priority}

        Current Financial Situation:
        - Monthly Income: $${userFinancialData.monthlyIncome || 0}
        - Monthly Expenses: $${userFinancialData.monthlyExpenses || 0}
        - Savings Rate: ${userFinancialData.savingsRate || 0}%
        - Net Worth: $${userFinancialData.netWorth || 0}

        Provide 3-5 specific, actionable recommendations to help achieve this goal.
        Focus on practical steps that can be implemented immediately.
      `

      const response = await this.client!.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial coach specializing in goal achievement. Provide practical, actionable advice for reaching financial goals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })

      const content = response.choices[0]?.message?.content || ''
      const recommendations = this.parseRecommendations(content)
      
      return {
        success: true,
        data: recommendations
      }
    } catch (error: any) {
      console.error('Error generating goal recommendations:', error)
      return {
        success: false,
        error: error.message || 'Failed to generate goal recommendations'
      }
    }
  }

  /**
   * Analyze financial data to create summary for AI processing
   * 
   * Processes transaction data to extract key metrics and patterns
   * that will be used by AI for generating insights.
   * 
   * @param transactions - Transaction history
   * @param goals - Financial goals
   * @param portfolio - Investment portfolio (optional)
   * @returns Financial summary object
   */
  private analyzeFinancialData(transactions: Transaction[], goals: FinancialGoal[], portfolio?: Portfolio) {
    // Calculate monthly income and expenses
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyIncome = transactions
      .filter(t => new Date(t.date) >= startOfMonth && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthlyExpenses = transactions
      .filter(t => new Date(t.date) >= startOfMonth && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0
    
    // Categorize spending
    const categoryTotals = this.categorizeTransactions(transactions)
    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category)
    
    // Generate spending insights
    const spendingInsights = this.generateSpendingInsights(categoryTotals)
    
    return {
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      topCategories,
      spendingInsights
    }
  }

  /**
   * Categorize transactions by spending category
   * 
   * Groups transactions by their category and calculates total spending
   * for each category to identify spending patterns.
   * 
   * @param transactions - Transaction list
   * @returns Object with category totals
   */
  private categorizeTransactions(transactions: Transaction[]): { [category: string]: number } {
    const categoryTotals: { [category: string]: number } = {}
    
    transactions.forEach(transaction => {
      if (transaction.amount < 0) { // Only expenses
        const category = transaction.category?.[0] || 'Uncategorized'
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount)
      }
    })
    
    return categoryTotals
  }

  /**
   * Generate spending insights from categorized data
   * 
   * Creates natural language insights about spending patterns
   * based on categorized transaction data.
   * 
   * @param categoryTotals - Spending by category
   * @returns Formatted spending insights string
   */
  private generateSpendingInsights(categoryTotals: { [category: string]: number }): string {
    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
    
    return topCategories.map(([category, amount]) => 
      `${category}: $${amount.toFixed(2)}`
    ).join(', ')
  }

  /**
   * Parse AI response into structured insights
   * 
   * Converts the natural language AI response into structured
   * insight objects that can be displayed in the UI.
   * 
   * @param content - Raw AI response content
   * @param userId - User identifier
   * @returns Array of structured insights
   */
  private parseAIResponse(content: string, userId: string): AIInsight[] {
    const insights: AIInsight[] = []
    const sections = content.split(/\d+\./).filter(section => section.trim())
    
    sections.forEach((section, index) => {
      try {
        const structured = this.extractStructuredContent(section)
        
                 if (structured.title && structured.description) {
           insights.push({
             id: `insight_${Date.now()}_${index}`,
             user_id: userId,
             type: (this.extractType(section) as 'optimization' | 'warning' | 'opportunity' | 'goal_progress' | 'spending_pattern' | 'investment_advice') || 'optimization',
             priority: (this.extractPriority(section) as 'low' | 'medium' | 'high') || 'medium',
             title: structured.title,
             description: this.formatDescription(
               structured.description,
               structured.impact,
               structured.actionItems
             ),
             impact_description: structured.impact,
             confidence_score: this.extractConfidence(section) || 75,
             category: 'general',
             actionable: true,
             action_items: structured.actionItems,
             created_date: new Date(),
             read: false,
             dismissed: false
           })
         }
      } catch (error) {
        console.error('Error parsing insight section:', error)
      }
    })
    
    return insights
  }

  /**
   * Extract structured content from AI response section
   * 
   * Parses a section of AI response to extract title, description,
   * impact, and action items.
   * 
   * @param section - Raw section content
   * @returns Structured content object
   */
  private extractStructuredContent(section: string): { title: string; description: string; impact: string; actionItems: string[] } {
    const lines = section.split('\n').filter(line => line.trim())
    
    let title = ''
    let description = ''
    let impact = ''
    let actionItems: string[] = []
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith('Title:')) {
        title = trimmed.replace('Title:', '').trim()
      } else if (trimmed.startsWith('Description:')) {
        description = trimmed.replace('Description:', '').trim()
      } else if (trimmed.startsWith('Impact:')) {
        impact = trimmed.replace('Impact:', '').trim()
      } else if (trimmed.startsWith('Action Items:')) {
        const itemsText = trimmed.replace('Action Items:', '').trim()
        actionItems = this.extractActionItems(itemsText)
      }
    })
    
    return { title, description, impact, actionItems }
  }

  /**
   * Format description with impact and action items
   * 
   * Combines description, impact, and action items into a comprehensive
   * insight description for display.
   * 
   * @param description - Base description
   * @param impact - Financial impact
   * @param actionItems - Actionable steps
   * @returns Formatted description
   */
  private formatDescription(description: string, impact: string, actionItems: string[]): string {
    let formatted = description
    
    if (impact) {
      formatted += ` ${impact}`
    }
    
    if (actionItems.length > 0) {
      formatted += ` Consider: ${actionItems.join(', ')}`
    }
    
    return formatted
  }

  /**
   * Extract action items from text
   * 
   * Parses action items from AI response text, handling various
   * formatting styles and separators.
   * 
   * @param content - Text containing action items
   * @returns Array of action items
   */
  private extractActionItems(content: string): string[] {
    // Remove markdown formatting
    const cleanContent = this.cleanMarkdownFormatting(content)
    
    // Split by common separators
    const items = cleanContent.split(/[•\-\*\.]/).filter(item => item.trim())
    
    return items.map(item => item.trim()).filter(item => item.length > 0)
  }

  /**
   * Clean markdown formatting from text
   * 
   * Removes markdown syntax and formatting characters from text
   * to extract clean content.
   * 
   * @param text - Text with markdown formatting
   * @returns Clean text without markdown
   */
  private cleanMarkdownFormatting(text: string): string {
    return text
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '')   // Remove italic
      .replace(/`/g, '')    // Remove code
      .replace(/#{1,6}\s/g, '') // Remove headers
      .trim()
  }

  /**
   * Parse spending patterns from AI response
   * 
   * Converts AI spending analysis into structured pattern objects
   * for display and further processing.
   * 
   * @param content - AI response content
   * @param categoryTotals - Spending by category
   * @returns Array of spending patterns
   */
  private parseSpendingPatterns(content: string, categoryTotals: { [category: string]: number }): SpendingPattern[] {
    const patterns: SpendingPattern[] = []
    const sections = content.split(/- Pattern:/).filter(section => section.trim())
    
    sections.forEach((section, index) => {
      try {
        const lines = section.split('\n').filter(line => line.trim())
        let pattern = ''
        let impact = ''
        let recommendation = ''
        let confidence = 75
        
        lines.forEach(line => {
          const trimmed = line.trim()
          if (trimmed.startsWith('Pattern:')) {
            pattern = trimmed.replace('Pattern:', '').trim()
          } else if (trimmed.startsWith('Impact:')) {
            impact = trimmed.replace('Impact:', '').trim()
          } else if (trimmed.startsWith('Recommendation:')) {
            recommendation = trimmed.replace('Recommendation:', '').trim()
          } else if (trimmed.startsWith('Confidence:')) {
            const confidenceStr = trimmed.replace('Confidence:', '').trim()
            confidence = parseInt(confidenceStr) || 75
          }
        })
        
                 if (pattern) {
           patterns.push({
             category: pattern,
             average_monthly: 0, // Will be calculated from actual data
             trend: 'stable' as const,
             trend_percentage: 0,
             seasonal_variations: false,
             predictions: []
           })
         }
      } catch (error) {
        console.error('Error parsing spending pattern:', error)
      }
    })
    
    return patterns
  }

  /**
   * Parse recommendations from AI response
   * 
   * Extracts individual recommendations from AI response text
   * for goal-specific advice.
   * 
   * @param content - AI response content
   * @returns Array of recommendation strings
   */
  private parseRecommendations(content: string): string[] {
    const recommendations: string[] = []
    const lines = content.split('\n').filter(line => line.trim())
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.match(/^\d+\./) || trimmed.startsWith('-') || trimmed.startsWith('•')) {
        const recommendation = trimmed.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim()
        if (recommendation) {
          recommendations.push(recommendation)
        }
      }
    })
    
    return recommendations
  }

  /**
   * Extract insight type from AI response
   * 
   * @param content - AI response section
   * @returns Insight type or default
   */
  private extractType(content: string): string | null {
    const typeMatch = content.match(/Type:\s*(optimization|warning|opportunity|goal_progress)/i)
    return typeMatch ? typeMatch[1] : null
  }

  /**
   * Extract priority from AI response
   * 
   * @param content - AI response section
   * @returns Priority level or default
   */
  private extractPriority(content: string): string | null {
    const priorityMatch = content.match(/Priority:\s*(high|medium|low)/i)
    return priorityMatch ? priorityMatch[1] : null
  }

  /**
   * Extract confidence score from AI response
   * 
   * @param content - AI response section
   * @returns Confidence score or default
   */
  private extractConfidence(content: string): number | null {
    const confidenceMatch = content.match(/Confidence:\s*(\d+)/i)
    return confidenceMatch ? parseInt(confidenceMatch[1]) : null
  }

  /**
   * Check if the service is running in demo mode
   * 
   * Demo mode is used when OpenAI API key is not configured,
   * allowing the application to function with mock insights.
   * 
   * @returns boolean - True if in demo mode
   */
  isDemoMode(): boolean {
    return !this.isConnected()
  }

  /**
   * Get connection status information
   * 
   * Provides detailed status about the OpenAI service configuration
   * and connection state for debugging and user feedback.
   * 
   * @returns Object with connection status and message
   */
  getConnectionStatus(): { connected: boolean; message: string } {
    if (!this.isConnected()) {
      return {
        connected: false,
        message: 'OpenAI API not configured. Add OPENAI_API_KEY to .env.local to enable AI insights and recommendations.'
      }
    }

    return {
      connected: true,
      message: 'OpenAI API connected and ready for AI-powered financial insights.'
    }
  }

  /**
   * Chat with AI about financial topics
   * 
   * Provides a conversational interface for users to ask questions
   * about their finances and receive AI-powered responses.
   * 
   * @param message - User's question or message
   * @param financialContext - User's financial data for context
   * @returns Promise<APIResponse> - AI response or error
   */
  async chat(message: string, financialContext: any): Promise<APIResponse<string>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'OpenAI API is not configured. Please add your OPENAI_API_KEY to .env.local'
      }
    }

    try {
      const contextPrompt = `
        You are a financial advisor helping a user with their personal finances.
        
        User's Financial Context:
        - Monthly Income: $${financialContext.monthlyIncome || 0}
        - Monthly Expenses: $${financialContext.monthlyExpenses || 0}
        - Savings Rate: ${financialContext.savingsRate || 0}%
        - Net Worth: $${financialContext.netWorth || 0}
        - Active Goals: ${financialContext.goals?.length || 0}
        
        Provide helpful, actionable advice based on their financial situation.
        Be conversational but professional. Keep responses concise and practical.
      `

      const response = await this.client!.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: contextPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      const content = response.choices[0]?.message?.content || ''
      
      return {
        success: true,
        data: content
      }
    } catch (error: any) {
      console.error('Error in AI chat:', error)
      return {
        success: false,
        error: error.message || 'Failed to get AI response'
      }
    }
  }

  /**
   * Generate budget recommendations
   * 
   * Analyzes spending patterns and financial goals to provide
   * personalized budget recommendations and optimization suggestions.
   * 
   * @param spendingAnalysis - Analysis of current spending
   * @param goals - User's financial goals
   * @param preferences - User preferences (optional)
   * @returns Promise<APIResponse> - Budget recommendations
   */
  async generateBudgetRecommendations(
    spendingAnalysis: any,
    goals: any[],
    preferences?: any
  ): Promise<APIResponse<any>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'OpenAI API is not configured. Please add your OPENAI_API_KEY to .env.local'
      }
    }

    try {
      const prompt = `
        Analyze the following spending data and provide budget recommendations:

        Spending Analysis:
        - Monthly Income: $${spendingAnalysis.monthlyIncome || 0}
        - Monthly Expenses: $${spendingAnalysis.monthlyExpenses || 0}
        - Top Spending Categories: ${spendingAnalysis.topCategories?.join(', ') || 'N/A'}
        - Savings Rate: ${spendingAnalysis.savingsRate || 0}%

        Financial Goals:
        ${goals.map(goal => `- ${goal.title}: $${goal.target_amount} (${goal.type})`).join('\n')}

        User Preferences:
        ${preferences ? Object.entries(preferences).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'None specified'}

        Provide:
        1. Recommended budget allocation by category
        2. Specific spending reduction strategies
        3. Savings optimization suggestions
        4. Goal achievement timeline adjustments
        5. Risk management recommendations

        Format as structured recommendations with specific dollar amounts and percentages.
      `

      const response = await this.client!.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a budget optimization specialist. Provide specific, actionable budget recommendations based on spending analysis and financial goals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1200
      })

      const content = response.choices[0]?.message?.content || ''
      
      return {
        success: true,
        data: {
          recommendations: content,
          generated_at: new Date().toISOString()
        }
      }
    } catch (error: any) {
      console.error('Error generating budget recommendations:', error)
      return {
        success: false,
        error: error.message || 'Failed to generate budget recommendations'
      }
    }
  }
}

// Create singleton instance
const openaiService = new OpenAIService()

/**
 * Get OpenAI configuration for client-side use
 * 
 * Returns configuration object that can be safely exposed to the client
 * without revealing sensitive API keys.
 * 
 * @returns Configuration object for OpenAI integration
 */
export const getOpenAIConfig = () => ({
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4',
})

export { openaiService } 