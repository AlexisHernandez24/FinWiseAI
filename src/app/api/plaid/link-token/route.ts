/**
 * Plaid Link Token API Route - Creates secure tokens for bank connections
 * Generates temporary tokens that allow users to securely connect their bank accounts
 */

import { NextRequest, NextResponse } from 'next/server'
import { plaidService } from '@/lib/plaid'

export async function POST(request: NextRequest) {
  try {
    // Extract user ID from request
    const { userId } = await request.json()
    
    // Validate user ID
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Create link token using Plaid service
    const result = await plaidService.createLinkToken(userId)
    
    // Return successful token creation
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        link_token: result.data.link_token
      })
    } else {
      // Return error response
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to create link token'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating link token:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 