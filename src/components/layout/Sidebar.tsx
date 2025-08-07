/**
 * Sidebar Component - Main navigation for FinWiseAI
 * Provides navigation links to all major sections of the application
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  PiggyBank, 
  TrendingUp, 
  Calculator,
  GitBranch,
  Settings,
  HelpCircle,
  Brain
} from 'lucide-react'

// Main navigation items
const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Budget Management', href: '/budget', icon: PiggyBank },
  { name: 'Portfolio Analysis', href: '/portfolio', icon: TrendingUp },
  { name: 'Retirement Planning', href: '/retirement', icon: Calculator },
  { name: 'Financial Scenarios', href: '/scenarios', icon: GitBranch },
  { name: 'AI Insights', href: '/ai-insights', icon: Brain },
]

// Secondary navigation items
const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/50 shadow-xl">
      {/* App logo and branding */}
      <div className="flex items-center px-6 py-6 border-b border-slate-200/50">
        <div className="flex items-center animate-slide-in-left">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="ml-3">
            <span className="text-xl font-bold text-gradient">FinWiseAI</span>
            <p className="text-xs text-slate-500 font-medium">Smart Finance</p>
          </div>
        </div>
      </div>

      {/* Main navigation menu */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out
                animate-slide-in-left
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 text-blue-700 shadow-lg border border-blue-200/50 backdrop-blur-sm' 
                  : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 hover:shadow-md hover:scale-[1.02]'
                }
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`
                p-2 rounded-lg mr-3 transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600'
                }
              `}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Secondary navigation (settings, help) */}
      <div className="px-3 py-4 border-t border-slate-200/50">
        <nav className="space-y-2">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300
                  ${isActive 
                    ? 'bg-slate-100 text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <item.icon className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User profile section */}
      <div className="px-3 py-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
        <div className="flex items-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">JD</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-slate-900">John Doe</p>
            <p className="text-xs text-slate-500">Premium Member</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  )
} 