import { NextRequest, NextResponse } from 'next/server'
import { openaiService } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { spendingAnalysis, goals, userPreferences, userId } = await request.json()

    if (!spendingAnalysis) {
      return NextResponse.json({
        success: false,
        error: 'Spending analysis data is required'
      }, { status: 400 })
    }

    console.log('🔄 Generating AI budget for user:', userId)
    console.log('📊 Budget generation data:', {
      hasSpendingAnalysis: !!spendingAnalysis,
      goalsCount: goals?.length || 0,
      hasPreferences: !!userPreferences
    })
    
    const result = await openaiService.generateBudgetRecommendations(
      spendingAnalysis,
      goals || [],
      userPreferences
    )

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        budget: result.data,
        message: 'AI budget generated successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate budget'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error generating AI budget:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 