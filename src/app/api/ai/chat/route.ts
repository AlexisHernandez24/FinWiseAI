/**
 * AI Chat API Route - Handles conversational AI interactions
 * Processes user messages with financial context and returns AI responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { openaiService } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Extract message and financial context from request
    const { message, financialContext, userId } = await request.json()

    // Validate required fields
    if (!message || !financialContext) {
      return NextResponse.json({
        success: false,
        error: 'Message and financial context are required'
      }, { status: 400 })
    }

    console.log('💬 AI Chat request from user:', userId)
    
    // Generate AI response using OpenAI service
    const result = await openaiService.chat(message, financialContext)

    // Return successful response
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        response: result.data,
        message: 'AI response generated successfully'
      })
    } else {
      // Return error response
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to generate AI response'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error in AI chat:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI response. Please check your OpenAI API configuration.'
    }, { status: 500 })
  }
} 