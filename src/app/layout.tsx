/**
 * Root Layout Component
 * 
 * This is the main layout wrapper for the entire FinWiseAI application.
 * It provides the basic HTML structure, metadata, and layout components
 * that are shared across all pages of the application.
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { InitializeApp, APIStatusIndicator } from '@/components/InitializeApp'

// Initialize the Inter font from Google Fonts for consistent typography
const inter = Inter({ subsets: ['latin'] })

// SEO and metadata configuration for the application
export const metadata: Metadata = {
  title: 'FinWiseAI - Intelligent Financial Planning',
  description: 'A comprehensive financial management and planning application with AI-powered insights',
  keywords: ['finance', 'ai', 'budgeting', 'investment', 'retirement planning'],
  authors: [{ name: 'FinWiseAI Team' }],
}

// Viewport configuration for responsive design
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

/**
 * RootLayout Component
 * 
 * This is the main layout wrapper that provides:
 * - HTML structure with proper language and hydration settings
 * - Font loading and application
 * - Sidebar navigation
 * - Header with search and user controls
 * - Main content area with proper scrolling
 * - API status monitoring
 * 
 * @param children - The page content to be rendered inside the layout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Initialize the application state and load initial data */}
        <InitializeApp />
        
        {/* Main application container with gradient background */}
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
          {/* Left sidebar for navigation */}
          <Sidebar />
          
          {/* Main content area with header and page content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top header with search and user controls */}
            <Header />
            
            {/* Main page content area with proper scrolling */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
              <div className="animate-fade-in">
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {/* API status indicator for monitoring external service connections */}
        <APIStatusIndicator />
      </body>
    </html>
  )
} 