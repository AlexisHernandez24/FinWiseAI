import { NextRequest, NextResponse } from 'next/server'
import { plaidService } from '@/lib/plaid'

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 400 })
    }

    console.log('🔄 Syncing institution data for access token:', accessToken.substring(0, 10) + '...')
    
    const result = await plaidService.syncInstitutionData(accessToken)

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Institution data synced successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to sync institution data'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error syncing institution data:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 