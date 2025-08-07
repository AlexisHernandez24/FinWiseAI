import { NextRequest, NextResponse } from 'next/server'
import { plaidService } from '@/lib/plaid'

export async function POST(request: NextRequest) {
  try {
    const { publicToken, userId, metadata } = await request.json()
    
    if (!publicToken || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Public token and user ID are required'
      }, { status: 400 })
    }

    const result = await plaidService.exchangePublicToken(publicToken, userId)
    
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        institution: result.data,
        message: 'Bank account connected successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to exchange token'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error exchanging public token:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 