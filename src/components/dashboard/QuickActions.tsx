'use client'

import { Plus, CreditCard, TrendingUp, Calculator, FileText, PiggyBank, ArrowRight } from 'lucide-react'

export function QuickActions() {
  const actions = [
    { 
      name: 'Add Transaction', 
      icon: Plus, 
      description: 'Record new expense',
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      name: 'Pay Bills', 
      icon: CreditCard, 
      description: 'Manage payments',
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    { 
      name: 'Invest Money', 
      icon: TrendingUp, 
      description: 'Grow your wealth',
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    { 
      name: 'Budget Calculator', 
      icon: Calculator, 
      description: 'Plan your spending',
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    { 
      name: 'Generate Report', 
      icon: FileText, 
      description: 'Financial insights',
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    { 
      name: 'Set Goal', 
      icon: PiggyBank, 
      description: 'Define targets',
      gradient: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    }
  ]

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
          <p className="text-slate-600 mt-1">Frequently used tools</p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="group relative p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className={`h-6 w-6 ${action.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">
                  {action.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {action.description}
                </p>
              </div>
            </div>
            
            {/* Hover gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
          </button>
        ))}
      </div>
      
      {/* All Actions Button */}
      <button className="w-full mt-6 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-sm">
        <span className="text-sm font-medium">View All Actions</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
} 