/**
 * Generate Insights API Route - Creates AI-powered financial insights
 * Analyzes transactions, goals, and portfolio data to generate personalized recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { openaiService } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Extract financial data from request
    const { transactions, goals, portfolio, userId } = await request.json()

    // Validate transactions data
    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({
        success: false,
        error: 'Transactions data is required'
      }, { status: 400 })
    }

    console.log('🔄 Generating AI insights for user:', userId)
    console.log('📊 Data summary:', {
      transactions: transactions.length,
      goals: goals?.length || 0,
      hasPortfolio: !!portfolio
    })
    
    // Generate insights using OpenAI service
    const result = await openaiService.generateFinancialInsights(
      transactions,
      goals || [],
      portfolio,
      userId
    )

    // Return successful insights
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        insights: result.data,
        message: 'AI insights generated successfully'
      })
    } else {
      // Return error response
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate insights'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 