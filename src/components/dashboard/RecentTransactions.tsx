'use client'

import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, Clock, Filter, ArrowRight } from 'lucide-react'

export function RecentTransactions() {
  const transactions = [
    {
      id: 1,
      description: 'Salary Deposit',
      merchant: 'TechCorp Inc.',
      category: 'Income',
      amount: 4250.00,
      type: 'income',
      date: '2024-01-15',
      time: '09:00 AM',
      status: 'completed'
    },
    {
      id: 2,
      description: 'Whole Foods Market',
      merchant: 'Grocery Store',
      category: 'Food & Dining',
      amount: -89.42,
      type: 'expense',
      date: '2024-01-14',
      time: '06:30 PM',
      status: 'completed'
    },
    {
      id: 3,
      description: 'Electric Bill',
      merchant: 'Pacific Gas & Electric',
      category: 'Utilities',
      amount: -125.80,
      type: 'expense',
      date: '2024-01-14',
      time: '02:15 PM',
      status: 'pending'
    },
    {
      id: 4,
      description: 'Investment Dividend',
      merchant: 'Vanguard',
      category: 'Investment',
      amount: 235.50,
      type: 'income',
      date: '2024-01-13',
      time: '12:00 PM',
      status: 'completed'
    },
    {
      id: 5,
      description: 'Shell Gas Station',
      merchant: 'Fuel',
      category: 'Transportation',
      amount: -45.00,
      type: 'expense',
      date: '2024-01-12',
      time: '08:45 AM',
      status: 'completed'
    }
  ]

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Income': '💰',
      'Food & Dining': '🍽️',
      'Utilities': '⚡',
      'Investment': '📈',
      'Transportation': '🚗'
    }
    return icons[category as keyof typeof icons] || '💳'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Income': 'bg-emerald-100 text-emerald-700',
      'Food & Dining': 'bg-orange-100 text-orange-700',
      'Utilities': 'bg-yellow-100 text-yellow-700',
      'Investment': 'bg-purple-100 text-purple-700',
      'Transportation': 'bg-blue-100 text-blue-700'
    }
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
          <p className="text-slate-600 mt-1">Last 5 transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Filter className="h-4 w-4" />
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <div 
            key={transaction.id} 
            className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-200 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow
                ${transaction.type === 'income' ? 'bg-emerald-100' : 'bg-slate-100'}
              `}>
                <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {transaction.description}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(transaction.category)}`}>
                    {transaction.category}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span>{transaction.merchant}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{transaction.time}</span>
                  </div>
                  {transaction.status === 'pending' && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-600 font-medium">Pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className={`
                  text-sm font-bold
                  ${transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}
                `}>
                  {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">{transaction.date}</p>
              </div>
              
              <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-200 rounded-lg transition-all">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-200">
        <button className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-sm">
          <span className="text-sm font-medium">Load More Transactions</span>
          <ArrowDownLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
} 