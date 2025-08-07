'use client'

import { HelpCircle, Settings, AlertCircle, CheckCircle, ExternalLink, MessageCircle, BookOpen, Video, FileText, Users, Shield, Zap, Search } from 'lucide-react'
import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { useApiStatus } from '@/hooks/useApiStatus'

export default function HelpPage() {
  const { user } = useFinancialStore()
  const { plaid: plaidStatus, openai: openaiStatus } = useApiStatus()
  const [searchQuery, setSearchQuery] = useState('')
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleFormChange = (field: string, value: string) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would send feedback to a server
    alert('Thank you for your feedback! We\'ll get back to you soon.')
    setFeedbackForm({ name: '', email: '', subject: '', message: '' })
  }

  const filteredFAQs = [
    {
      question: "How do I connect my bank account?",
      answer: plaidStatus.connected 
        ? "Go to the Dashboard and click 'Connect Bank Account'. Follow the Plaid Link flow to securely connect your financial institution."
        : "You need to configure your Plaid API keys first. Add PLAID_CLIENT_ID and PLAID_SECRET to your .env.local file, then restart the app."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes, we use bank-level security with 256-bit encryption. Your data is never stored in plain text and we follow industry-standard security practices."
    },
    {
      question: "How do I enable AI insights?",
      answer: openaiStatus.connected
        ? "AI insights are enabled! Go to the AI Insights tab and click 'Generate Insights' to get personalized recommendations."
        : "You need to configure your OpenAI API key first. Add OPENAI_API_KEY to your .env.local file to enable AI-powered features."
    },
    {
      question: "Can I use the app without connecting real accounts?",
      answer: "Yes! The app works in demo mode when APIs aren't configured. You'll see sample data and can explore all features without real connections."
    },
    {
      question: "How often is my data updated?",
      answer: plaidStatus.connected
        ? "Connected accounts are typically updated every few hours. You can also manually sync by clicking the refresh button on any connected account."
        : "When you connect real accounts, data updates automatically every few hours. In demo mode, data is static for demonstration purposes."
    },
    {
      question: "What happens if I disconnect an account?",
      answer: "Disconnecting an account removes it from your dashboard but doesn't delete historical data. You can reconnect the same account later."
    }
  ].filter(faq => 
    searchQuery === '' || 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-teal-600 to-blue-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        <div className="relative p-8 lg:p-12 text-white">
          <div className="flex items-center space-x-2 mb-4">
            <HelpCircle className="h-8 w-8 text-white" />
            <div className="flex items-center space-x-2 text-white/80 text-sm">
              <BookOpen className="h-4 w-4" />
              <span>Support & Documentation</span>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Help & Support
          </h1>
          <p className="text-xl text-white/90 max-w-2xl leading-relaxed mb-6">
            Find answers to common questions and get help with FinWiseAI.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/70" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="block w-full pl-10 pr-3 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
        <h2 className="text-xl font-bold text-slate-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border ${
            plaidStatus.connected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center space-x-3">
              {plaidStatus.connected ? <Shield className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5 text-amber-600" />}
              <div>
                <p className={`font-semibold ${plaidStatus.connected ? 'text-green-900' : 'text-amber-900'}`}>
                  Plaid Integration
                </p>
                <p className={`text-sm ${plaidStatus.connected ? 'text-green-700' : 'text-amber-700'}`}>
                  {plaidStatus.message}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border ${
            openaiStatus.connected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center space-x-3">
              {openaiStatus.connected ? <Shield className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5 text-amber-600" />}
              <div>
                <p className={`font-semibold ${openaiStatus.connected ? 'text-green-900' : 'text-amber-900'}`}>
                  AI Features
                </p>
                <p className={`text-sm ${openaiStatus.connected ? 'text-green-700' : 'text-amber-700'}`}>
                  {openaiStatus.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - FAQs and Articles */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                <MessageCircle className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-1">Live Chat</h3>
                <p className="text-sm text-blue-700">Get instant help</p>
                <p className="text-xs text-blue-600 mt-2">Available 24/7</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                <Shield className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-1">Documentation</h3>
                <p className="text-sm text-green-700">Learn how to use FinWiseAI</p>
                <p className="text-xs text-green-600 mt-2">Detailed guides</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer">
                <Shield className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-900 mb-1">API Status</h3>
                <p className="text-sm text-purple-700">Check system health</p>
                <p className="text-xs text-purple-600 mt-2">System uptime</p>
              </div>
            </div>
          </div>

          {/* Help Categories */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Help Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Getting Started', icon: BookOpen, count: 8, description: 'Setup and initial configuration' },
                { title: 'Account Management', icon: FileText, count: 12, description: 'Managing your account and data' },
                { title: 'Security & Privacy', icon: Shield, count: 6, description: 'Keeping your data safe' },
                { title: 'Troubleshooting', icon: HelpCircle, count: 15, description: 'Common issues and solutions' }
              ].map((category, index) => (
                <div key={index} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <category.icon className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{category.title}</h3>
                      <p className="text-sm text-slate-600">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-slate-900">{category.count}</span>
                      <p className="text-xs text-slate-500">articles</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <details key={index} className="group border border-slate-200 rounded-lg">
                  <summary className="p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-900">{faq.question}</h3>
                      <HelpCircle className="h-5 w-5 text-slate-400 group-open:rotate-45 transition-transform" />
                    </div>
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
              
              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-600">No FAQs found matching your search</p>
                  <p className="text-sm text-slate-500">Try different keywords or browse all categories</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          
          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Email</p>
                  <p className="text-sm text-slate-600">support@finwiseai.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Phone</p>
                  <p className="text-sm text-slate-600">1-800-FINWISE</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-900">Live Chat</p>
                  <p className="text-sm text-slate-600">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Updates</h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Enhanced Security</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Added two-factor authentication support
                    </p>
                    <p className="text-xs text-blue-600 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">AI Improvements</p>
                    <p className="text-xs text-green-700 mt-1">
                      More accurate spending predictions
                    </p>
                    <p className="text-xs text-green-600 mt-1">1 week ago</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">New Features</p>
                    <p className="text-xs text-purple-700 mt-1">
                      Advanced scenario planning tools
                    </p>
                    <p className="text-xs text-purple-600 mt-1">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Send Feedback */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Send Feedback</h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={feedbackForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="Your email"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={feedbackForm.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  placeholder="Subject"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  placeholder="Your message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span className="font-medium">Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 