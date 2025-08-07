/**
 * Financial Store - Global State Management
 * 
 * This is the central state management store for the entire FinWiseAI application.
 * It manages all financial data, user information, goals, budgets, and AI insights.
 * The store uses Zustand with persistence to maintain state across browser sessions.
 * 
 * Key responsibilities:
 * - User data management
 * - Financial data from Plaid API
 * - Goal and budget tracking
 * - AI insights generation and management
 * - Loading states and error handling
 * - Calculated financial metrics
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  User, 
  PlaidAccount, 
  Transaction, 
  Investment, 
  FinancialGoal, 
  Budget, 
  AIInsight, 
  Portfolio, 
  ConnectedInstitution,
  DashboardData
} from '@/types/financial'
import { plaidService } from '@/lib/plaid'
import { openaiService } from '@/lib/openai'

/**
 * FinancialState Interface
 * 
 * Defines the complete state structure and all available actions for the financial store.
 * This interface ensures type safety across the entire application.
 */
interface FinancialState {
  // ===== STATE PROPERTIES =====
  
  // User data
  user: User | null
  
  // Financial data from Plaid API
  connectedInstitutions: ConnectedInstitution[]  // List of connected bank institutions
  accounts: PlaidAccount[]                      // Bank accounts with balances
  transactions: Transaction[]                   // Financial transactions
  investments: Investment[]                     // Investment holdings
  portfolio: Portfolio | null                  // Calculated portfolio summary
  
  // User-defined financial data
  goals: FinancialGoal[]                       // Financial goals and targets
  budgets: Budget[]                           // Budget categories and limits
  
  // AI-generated insights
  insights: AIInsight[]                       // AI-powered financial recommendations
  
  // Loading and error states
  isLoading: boolean                          // General loading state
  isConnecting: boolean                       // Plaid connection loading
  isSyncing: boolean                         // Data synchronization loading
  isGeneratingInsights: boolean              // AI insights generation loading
  error: string | null                       // Error message display
  
  // ===== USER ACTIONS =====
  setUser: (user: User) => void
  clearUser: () => void
  
  // ===== PLAID INTEGRATION ACTIONS =====
  connectInstitution: (publicToken: string) => Promise<boolean>  // Connect new bank account
  syncAllData: () => Promise<void>                               // Sync all connected accounts
  syncInstitution: (accessToken: string) => Promise<void>        // Sync specific institution
  removeInstitution: (institutionId: string) => void            // Disconnect bank account
  
  // ===== GOAL MANAGEMENT ACTIONS =====
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'created_date'>) => void
  updateGoal: (goalId: string, updates: Partial<FinancialGoal>) => void
  deleteGoal: (goalId: string) => void
  
  // ===== BUDGET MANAGEMENT ACTIONS =====
  addBudget: (budget: Omit<Budget, 'id'>) => void
  updateBudget: (budgetId: string, updates: Partial<Budget>) => void
  deleteBudget: (budgetId: string) => void
  
  // ===== AI INSIGHTS ACTIONS =====
  generateInsights: () => Promise<void>                          // Generate AI insights
  markInsightAsRead: (insightId: string) => void                // Mark insight as read
  dismissInsight: (insightId: string) => void                   // Dismiss insight
  
  // ===== CALCULATED VALUES =====
  getNetWorth: () => number                                     // Calculate total net worth
  getMonthlyIncome: () => number                                // Calculate monthly income
  getMonthlyExpenses: () => number                              // Calculate monthly expenses
  getSavingsRate: () => number                                  // Calculate savings rate
  getDashboardData: () => DashboardData | null                  // Get dashboard metrics
  
  // ===== UTILITY ACTIONS =====
  setLoading: (loading: boolean) => void                        // Set loading state
  setError: (error: string | null) => void                      // Set error message
  clearError: () => void                                        // Clear error message
  updatePortfolio: () => void                                   // Recalculate portfolio
  resetStore: () => void                                        // Reset all data
}

/**
 * useFinancialStore - Zustand Store Creation
 * 
 * Creates the global financial store with persistence middleware.
 * The store automatically saves state to localStorage and restores it on page load.
 */
export const useFinancialStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      // ===== INITIAL STATE =====
      
      // User data
      user: null,
      
      // Financial data arrays
      connectedInstitutions: [],
      accounts: [],
      transactions: [],
      investments: [],
      portfolio: null,
      
      // User-defined data
      goals: [],
      budgets: [],
      insights: [],
      
      // Loading states
      isLoading: false,
      isConnecting: false,
      isSyncing: false,
      isGeneratingInsights: false,
      
      // Error state
      error: null,
      
      // ===== USER MANAGEMENT ACTIONS =====
      
      /**
       * Set user data in the store
       * @param user - User object with profile information
       */
      setUser: (user) => set({ user }),
      
      /**
       * Clear user data and reset to initial state
       */
      clearUser: () => set({
        user: null,
        connectedInstitutions: [],
        accounts: [],
        transactions: [],
        investments: [],
        portfolio: null,
        goals: [],
        budgets: [],
        insights: [],
        error: null
      }),
      
      // ===== PLAID INTEGRATION ACTIONS =====
      
      /**
       * Connect a new financial institution using Plaid Link
       * 
       * This function:
       * 1. Exchanges the public token for an access token
       * 2. Adds the institution to the connected list
       * 3. Syncs the institution's data
       * 4. Updates the store with new financial data
       * 
       * @param publicToken - Public token from Plaid Link
       * @returns Promise<boolean> - Success status
       */
      connectInstitution: async (publicToken) => {
        const state = get()
        if (!state.user) {
          console.error('❌ No user found in store')
          return false
        }

        console.log('🔄 Starting connectInstitution with public token:', publicToken.substring(0, 10) + '...')
        set({ isConnecting: true, error: null })

        try {
          console.log('📞 Calling /api/plaid/exchange-token...')
          const response = await fetch('/api/plaid/exchange-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              publicToken, 
              userId: state.user.id 
            }),
          })

          const result = await response.json()
          console.log('📡 API response:', result)
          
          if (result.success && result.institution) {
            console.log('✅ Token exchange successful, adding institution to store...')
            set(state => ({
              connectedInstitutions: [...state.connectedInstitutions, result.institution],
              isConnecting: false
            }))
            
            console.log('🔄 Syncing institution data...')
            // Sync data for new institution
            await get().syncInstitution(result.institution.access_token)
            console.log('✅ Institution connection completed successfully')
            return true
          } else {
            console.error('❌ Token exchange failed:', result.error)
            set({ error: result.error || 'Failed to connect institution', isConnecting: false })
            return false
          }
        } catch (error) {
          console.error('❌ Exception in connectInstitution:', error)
          set({ error: 'Failed to connect institution', isConnecting: false })
          return false
        }
      },

      /**
       * Sync all connected institutions' data
       * 
       * Iterates through all connected institutions and syncs their data,
       * then generates new AI insights based on the updated data.
       */
      syncAllData: async () => {
        const state = get()
        if (state.connectedInstitutions.length === 0) return

        set({ isSyncing: true, error: null })

        try {
          for (const institution of state.connectedInstitutions) {
            await get().syncInstitution(institution.access_token)
          }
          
          // Generate new insights after syncing
          await get().generateInsights()
          
          set({ isSyncing: false })
        } catch (error) {
          set({ error: 'Failed to sync financial data', isSyncing: false })
        }
      },

      /**
       * Sync data for a specific institution
       * 
       * Fetches accounts, transactions, and investments from Plaid API
       * and updates the store with the latest data.
       * 
       * @param accessToken - Institution's access token
       */
      syncInstitution: async (accessToken) => {
        try {
          console.log('🔄 Syncing institution data via API...')
          const response = await fetch('/api/plaid/sync-institution', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken }),
          })

          const result = await response.json()
          console.log('📡 Sync API response:', result)
          
          if (result.success && result.data) {
            set(state => ({
              accounts: [...state.accounts.filter(acc => 
                !result.data.accounts.some((newAcc: any) => newAcc.account_id === acc.account_id)
              ), ...result.data.accounts],
              transactions: [...state.transactions.filter(trans => 
                !result.data.transactions.some((newTrans: any) => newTrans.id === trans.id)
              ), ...result.data.transactions],
              investments: [...state.investments.filter(inv => 
                !result.data.investments.some((newInv: any) => newInv.security_id === inv.security_id)
              ), ...result.data.investments]
            }))
            
            // Update portfolio
            get().updatePortfolio()
            console.log('✅ Institution data synced successfully')
          } else {
            console.error('❌ Sync failed:', result.error)
            set({ error: result.error || 'Failed to sync institution data' })
          }
        } catch (error) {
          console.error('❌ Exception in syncInstitution:', error)
          set({ error: 'Failed to sync institution data' })
        }
      },

      /**
       * Remove a connected institution
       * 
       * Removes the institution and all its associated data from the store.
       * 
       * @param institutionId - ID of the institution to remove
       */
      removeInstitution: (institutionId) => {
        const state = get()
        const institution = state.connectedInstitutions.find(inst => inst.institution_id === institutionId)
        
        if (institution) {
          // Remove institution and its data
          set(state => ({
            connectedInstitutions: state.connectedInstitutions.filter(inst => inst.institution_id !== institutionId),
            accounts: state.accounts.filter(acc => acc.institution_id !== institutionId),
            transactions: state.transactions.filter(trans => trans.institution_id !== institutionId),
            investments: state.investments.filter(inv => inv.institution_id !== institutionId)
          }))
          
          // Update portfolio
          get().updatePortfolio()
        }
      },
      
      // ===== GOAL MANAGEMENT ACTIONS =====
      
      /**
       * Add a new financial goal
       * 
       * @param goal - Goal object without id and created_date (auto-generated)
       */
      addGoal: (goal) => {
        const newGoal: FinancialGoal = {
          ...goal,
          id: `goal_${Date.now()}`,
          created_date: new Date().toISOString(),
          status: 'active'
        }
        set(state => ({ goals: [...state.goals, newGoal] }))
      },

      /**
       * Update an existing financial goal
       * 
       * @param goalId - ID of the goal to update
       * @param updates - Partial goal object with fields to update
       */
      updateGoal: (goalId, updates) => {
        set(state => ({
          goals: state.goals.map(goal => 
            goal.id === goalId 
              ? { ...goal, ...updates, updated_date: new Date().toISOString() }
              : goal
          )
        }))
      },

      /**
       * Delete a financial goal
       * 
       * @param goalId - ID of the goal to delete
       */
      deleteGoal: (goalId) => {
        set(state => ({
          goals: state.goals.filter(goal => goal.id !== goalId)
        }))
      },
      
      // ===== BUDGET MANAGEMENT ACTIONS =====
      
      /**
       * Add a new budget
       * 
       * @param budget - Budget object without id (auto-generated)
       */
      addBudget: (budget) => {
        const newBudget: Budget = {
          ...budget,
          id: `budget_${Date.now()}`,
          created_date: new Date().toISOString()
        }
        set(state => ({ budgets: [...state.budgets, newBudget] }))
      },

      /**
       * Update an existing budget
       * 
       * @param budgetId - ID of the budget to update
       * @param updates - Partial budget object with fields to update
       */
      updateBudget: (budgetId, updates) => {
        set(state => ({
          budgets: state.budgets.map(budget => 
            budget.id === budgetId 
              ? { ...budget, ...updates, updated_date: new Date().toISOString() }
              : budget
          )
        }))
      },

      /**
       * Delete a budget
       * 
       * @param budgetId - ID of the budget to delete
       */
      deleteBudget: (budgetId) => {
        set(state => ({
          budgets: state.budgets.filter(budget => budget.id !== budgetId)
        }))
      },
      
      // ===== AI INSIGHTS ACTIONS =====
      
      /**
       * Generate AI insights based on current financial data
       * 
       * This function:
       * 1. Analyzes transactions, accounts, and goals
       * 2. Calls OpenAI API for intelligent insights
       * 3. Updates the store with new insights
       */
      generateInsights: async () => {
        const state = get()
        if (!state.user || state.transactions.length === 0) return

        set({ isGeneratingInsights: true, error: null })

        try {
          const insights = await openaiService.generateInsights({
            transactions: state.transactions,
            accounts: state.accounts,
            goals: state.goals,
            budgets: state.budgets,
            user: state.user
          })

          set(state => ({
            insights: [...state.insights, ...insights],
            isGeneratingInsights: false
          }))
        } catch (error) {
          console.error('❌ Failed to generate insights:', error)
          set({ 
            error: 'Failed to generate AI insights', 
            isGeneratingInsights: false 
          })
        }
      },

      /**
       * Mark an insight as read
       * 
       * @param insightId - ID of the insight to mark as read
       */
      markInsightAsRead: (insightId) => {
        set(state => ({
          insights: state.insights.map(insight => 
            insight.id === insightId 
              ? { ...insight, is_read: true }
              : insight
          )
        }))
      },

      /**
       * Dismiss an insight (remove from display)
       * 
       * @param insightId - ID of the insight to dismiss
       */
      dismissInsight: (insightId) => {
        set(state => ({
          insights: state.insights.filter(insight => insight.id !== insightId)
        }))
      },
      
      // ===== CALCULATED VALUES =====
      
      /**
       * Calculate total net worth from all accounts
       * 
       * @returns Total net worth as a number
       */
      getNetWorth: () => {
        const state = get()
        return state.accounts.reduce((total, account) => {
          return total + (account.balances.current || 0)
        }, 0)
      },

      /**
       * Calculate monthly income from transactions
       * 
       * @returns Monthly income as a number
       */
      getMonthlyIncome: () => {
        const state = get()
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        return state.transactions
          .filter(trans => {
            const transDate = new Date(trans.date)
            return transDate >= startOfMonth && trans.amount > 0
          })
          .reduce((total, trans) => total + trans.amount, 0)
      },

      /**
       * Calculate monthly expenses from transactions
       * 
       * @returns Monthly expenses as a number
       */
      getMonthlyExpenses: () => {
        const state = get()
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        return state.transactions
          .filter(trans => {
            const transDate = new Date(trans.date)
            return transDate >= startOfMonth && trans.amount < 0
          })
          .reduce((total, trans) => total + Math.abs(trans.amount), 0)
      },

      /**
       * Calculate savings rate as percentage
       * 
       * @returns Savings rate as a percentage (0-100)
       */
      getSavingsRate: () => {
        const income = get().getMonthlyIncome()
        const expenses = get().getMonthlyExpenses()
        
        if (income === 0) return 0
        return ((income - expenses) / income) * 100
      },

      /**
       * Get comprehensive dashboard data
       * 
       * @returns DashboardData object with all key metrics
       */
      getDashboardData: () => {
        const state = get()
        if (!state.user) return null

        return {
          netWorth: get().getNetWorth(),
          monthlyIncome: get().getMonthlyIncome(),
          monthlyExpenses: get().getMonthlyExpenses(),
          savingsRate: get().getSavingsRate(),
          totalAccounts: state.accounts.length,
          totalTransactions: state.transactions.length,
          totalGoals: state.goals.length,
          activeGoals: state.goals.filter(goal => goal.status === 'active').length,
          totalBudgets: state.budgets.length,
          unreadInsights: state.insights.filter(insight => !insight.is_read).length
        }
      },
      
      // ===== UTILITY ACTIONS =====
      
      /**
       * Set loading state
       * 
       * @param loading - Boolean loading state
       */
      setLoading: (loading) => set({ isLoading: loading }),

      /**
       * Set error message
       * 
       * @param error - Error message string or null
       */
      setError: (error) => set({ error }),

      /**
       * Clear error message
       */
      clearError: () => set({ error: null }),

      /**
       * Update portfolio calculations
       * 
       * Recalculates portfolio metrics based on current investments
       */
      updatePortfolio: () => {
        const state = get()
        if (state.investments.length === 0) {
          set({ portfolio: null })
          return
        }

        const totalValue = state.investments.reduce((sum, inv) => sum + (inv.current_value || 0), 0)
        const totalCost = state.investments.reduce((sum, inv) => sum + (inv.cost_basis || 0), 0)
        const gainLoss = totalValue - totalCost
        const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

        set({
          portfolio: {
            id: 'user_portfolio',
            user_id: state.user?.id || '',
            name: 'User Portfolio',
            total_value: totalValue,
            total_cost: totalCost,
            gain_loss: gainLoss,
            gain_loss_percent: gainLossPercent,
            holdings: state.investments,
            last_updated: new Date().toISOString()
          }
        })
      },

      /**
       * Reset all store data to initial state
       * 
       * Clears all financial data, goals, budgets, and insights
       */
      resetStore: () => {
        set({
          user: null,
          connectedInstitutions: [],
          accounts: [],
          transactions: [],
          investments: [],
          portfolio: null,
          goals: [],
          budgets: [],
          insights: [],
          isLoading: false,
          isConnecting: false,
          isSyncing: false,
          isGeneratingInsights: false,
          error: null
        })
      }
    }),
    {
      name: 'finwise-store', // localStorage key
      partialize: (state) => ({
        // Only persist these fields to localStorage
        user: state.user,
        connectedInstitutions: state.connectedInstitutions,
        accounts: state.accounts,
        transactions: state.transactions,
        investments: state.investments,
        portfolio: state.portfolio,
        goals: state.goals,
        budgets: state.budgets,
        insights: state.insights
      })
    }
  )
) 