'use client'

import { useState } from 'react'
import { Plus, Target, Calendar, DollarSign, TrendingUp, Edit, Trash2, CheckCircle } from 'lucide-react'
import { FinancialGoal } from '@/types/financial'
import { useFinancialStore } from '@/store/financialStore'

interface GoalManagerProps {
  showAddGoal?: boolean
}

export function GoalManager({ showAddGoal = true }: GoalManagerProps) {
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  
  const { goals, addGoal, updateGoal, deleteGoal } = useFinancialStore()

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'savings' as FinancialGoal['type'],
    target_amount: 0,
    current_amount: 0,
    target_date: '',
    priority: 'medium' as FinancialGoal['priority']
  })

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target_amount || !newGoal.target_date) {
      return
    }

    addGoal({
      ...newGoal,
      target_date: new Date(newGoal.target_date),
      user_id: 'user_' + Date.now(),
      status: 'active',
      milestones: []
    })

    setNewGoal({
      title: '',
      description: '',
      type: 'savings',
      target_amount: 0,
      current_amount: 0,
      target_date: '',
      priority: 'medium'
    })
    setIsAddingGoal(false)
  }

  const handleUpdateProgress = (goalId: string, newAmount: number) => {
    updateGoal(goalId, { current_amount: newAmount })
  }

  const calculateProgress = (goal: FinancialGoal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  }

  const getTimeRemaining = (targetDate: Date) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
    return `${Math.floor(diffDays / 365)} years`
  }

  const getGoalIcon = (type: FinancialGoal['type']) => {
    switch (type) {
      case 'savings': return '💰'
      case 'debt_payoff': return '💳'
      case 'investment': return '📈'
      case 'retirement': return '🏖️'
      case 'emergency_fund': return '🛡️'
      case 'purchase': return '🛒'
      default: return '🎯'
    }
  }

  const getPriorityColor = (priority: FinancialGoal['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Goals</h2>
          <p className="text-slate-600 mt-1">Track and achieve your financial objectives</p>
        </div>
        {showAddGoal && (
          <button 
            onClick={() => setIsAddingGoal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Goal</span>
          </button>
        )}
      </div>

      {/* Add Goal Form */}
      {isAddingGoal && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Goal Title</label>
              <input 
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Emergency Fund"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Goal Type</label>
              <select 
                value={newGoal.type}
                onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as FinancialGoal['type'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="savings">Savings</option>
                <option value="debt_payoff">Debt Payoff</option>
                <option value="investment">Investment</option>
                <option value="retirement">Retirement</option>
                <option value="emergency_fund">Emergency Fund</option>
                <option value="purchase">Major Purchase</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Amount</label>
              <input 
                type="number"
                value={newGoal.target_amount}
                onChange={(e) => setNewGoal({ ...newGoal, target_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Amount</label>
              <input 
                type="number"
                value={newGoal.current_amount}
                onChange={(e) => setNewGoal({ ...newGoal, current_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Date</label>
              <input 
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select 
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as FinancialGoal['priority'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea 
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your goal..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              onClick={() => setIsAddingGoal(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddGoal}
              className="btn-primary"
            >
              Create Goal
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-200/50 text-center">
          <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
          <p className="text-slate-600 mb-6">Start by creating your first financial goal to track your progress.</p>
          <button 
            onClick={() => setIsAddingGoal(true)}
            className="btn-primary"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal)
            const isCompleted = progress >= 100
            const timeRemaining = getTimeRemaining(goal.target_date)
            
            return (
              <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getGoalIcon(goal.type)}</div>
                    <div>
                      <h3 className="font-bold text-slate-900">{goal.title}</h3>
                      <p className="text-sm text-slate-600">{goal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => setEditingGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">{progress.toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Current</p>
                      <p className="font-semibold text-slate-900">${goal.current_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Target</p>
                      <p className="font-semibold text-slate-900">${goal.target_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{timeRemaining}</span>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    )}
                  </div>

                  {!isCompleted && (
                    <div className="pt-2">
                      <input 
                        type="number"
                        placeholder="Add to goal..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            const amount = Number(input.value)
                            if (amount > 0) {
                              handleUpdateProgress(goal.id, goal.current_amount + amount)
                              input.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 