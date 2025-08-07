import { NextRequest, NextResponse } from 'next/server'
import { openaiService } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { transactions, goals, portfolio, userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await openaiService.generateFinancialInsights(
      transactions || [],
      goals || [],
      portfolio,
      userId
    )

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 