import { NextResponse } from 'next/server'
import { plaidService } from '@/lib/plaid'
import { openaiService } from '@/lib/openai'

export async function GET() {
  try {
    // Force re-initialization of services
    plaidService.reinitialize()
    openaiService.reinitialize()
    
    const plaidStatus = plaidService.getConnectionStatus()
    const openaiStatus = openaiService.getConnectionStatus()
    
    return NextResponse.json({
      success: true,
      plaid: plaidStatus,
      openai: openaiStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking API status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check API status',
      plaid: { connected: false, message: 'Error checking status' },
      openai: { connected: false, message: 'Error checking status' }
    }, { status: 500 })
  }
} 