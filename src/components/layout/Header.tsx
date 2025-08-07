/**
 * Header Component - Top navigation bar with search and user controls
 */

'use client'

import { Bell, Search, User } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 lg:px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Global search bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search transactions, accounts, or insights..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-300 text-slate-700 placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:block">
              <kbd className="px-2 py-1 text-xs text-slate-400 bg-slate-100 rounded border">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* User controls and notifications */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Quick action button */}
          <button className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            <span className="text-sm font-medium">Add Transaction</span>
          </button>

          {/* Notification bell with indicator */}
          <button className="relative p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-300 group">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>

          {/* User profile menu */}
          <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-300 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">John Doe</p>
              <p className="text-xs text-slate-500">Premium Member</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-sm font-bold text-white">JD</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 