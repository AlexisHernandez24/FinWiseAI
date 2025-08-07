/**
 * Plaid Service - Financial Data Integration
 * 
 * This service handles all interactions with the Plaid API for secure financial data access.
 * It provides methods for connecting bank accounts, retrieving transactions, accounts,
 * and investment data from financial institutions.
 * 
 * Key responsibilities:
 * - Secure bank account connections via Plaid Link
 * - Transaction data retrieval and processing
 * - Account balance and information fetching
 * - Investment holdings data access
 * - Error handling and connection status monitoring
 */

import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid'
import { PlaidAccount, Transaction, Investment, APIResponse, ConnectedInstitution } from '@/types/financial'

/**
 * PlaidService Class
 * 
 * Manages all Plaid API interactions with proper error handling and configuration.
 * Uses singleton pattern to ensure consistent API client usage across the application.
 */
class PlaidService {
  private client: PlaidApi | null = null
  private isConfigured: boolean = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize or re-initialize the Plaid service
   * 
   * Sets up the Plaid API client with environment variables.
   * Checks for proper configuration and logs status for debugging.
   */
  private initialize() {
    const clientId = process.env.PLAID_CLIENT_ID
    const secret = process.env.PLAID_SECRET
    
    // Debug logging to verify environment variables
    console.log('PlaidService Environment Check:', {
      hasClientId: !!clientId,
      hasSecret: !!secret,
      clientIdLength: clientId?.length,
      secretLength: secret?.length,
      clientIdStart: clientId?.substring(0, 10) + '...',
      secretStart: secret?.substring(0, 10) + '...'
    })
    
    // Validate configuration and create API client
    if (clientId && secret && clientId.length > 5 && secret.length > 5) {
      const configuration = new Configuration({
        basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': clientId,
            'PLAID-SECRET': secret,
          },
        },
      })
      this.client = new PlaidApi(configuration)
      this.isConfigured = true
    }
  }

  /**
   * Force re-initialization of the service
   * 
   * Useful for client-side updates or when environment variables change.
   */
  reinitialize() {
    this.initialize()
  }

  /**
   * Check if Plaid is properly configured and connected
   * 
   * @returns boolean - True if service is ready for API calls
   */
  isConnected(): boolean {
    return this.isConfigured && this.client !== null
  }

  /**
   * Create a link token for Plaid Link integration
   * 
   * This token is used to initialize the Plaid Link interface for connecting
   * bank accounts securely. The token contains configuration for the Link flow.
   * 
   * @param userId - Unique identifier for the user
   * @returns Promise<APIResponse> - Link token or error response
   */
  async createLinkToken(userId: string): Promise<APIResponse<{ link_token: string }>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'Plaid API is not configured. Please add your PLAID_CLIENT_ID and PLAID_SECRET to .env.local'
      }
    }

    try {
      const response = await this.client!.linkTokenCreate({
        user: {
          client_user_id: userId
        },
        client_name: 'FinWiseAI',
        products: [Products.Transactions, Products.Investments, Products.Identity],
        country_codes: [CountryCode.Us],
        language: 'en'
      })

      return {
        success: true,
        data: { link_token: response.data.link_token }
      }
    } catch (error: any) {
      console.error('Error creating link token:', error)
      return {
        success: false,
        error: error.response?.data?.error_message || 'Failed to create link token'
      }
    }
  }

  /**
   * Exchange public token for access token
   * 
   * After a user successfully connects their bank account through Plaid Link,
   * the public token must be exchanged for a permanent access token that can
   * be used for future API calls to retrieve financial data.
   * 
   * @param publicToken - Temporary token from Plaid Link
   * @param userId - User identifier for the connection
   * @returns Promise<APIResponse> - Access token and institution info or error
   */
  async exchangePublicToken(publicToken: string, userId: string): Promise<APIResponse<ConnectedInstitution>> {
    console.log('🔄 exchangePublicToken called with userId:', userId)
    
    if (!this.isConnected()) {
      console.error('❌ Plaid service not connected')
      return {
        success: false,
        error: 'Plaid API is not configured. Please add your PLAID_CLIENT_ID and PLAID_SECRET to .env.local'
      }
    }

    try {
      console.log('📞 Calling Plaid itemPublicTokenExchange...')
      const response = await this.client!.itemPublicTokenExchange({
        public_token: publicToken
      })

      console.log('✅ Token exchange successful, got access token and item ID')

      // Get institution information
      const institutionResponse = await this.client!.institutionsGetById({
        institution_id: response.data.item.institution_id,
        country_codes: [CountryCode.Us],
        options: {
          include_optional_metadata: true
        }
      })

      const institution = institutionResponse.data.institution

      return {
        success: true,
        data: {
          institution_id: institution.institution_id,
          name: institution.name,
          logo: institution.logo,
          primary_color: institution.primary_color,
          access_token: response.data.access_token,
          item_id: response.data.item_id,
          user_id: userId,
          connected_date: new Date().toISOString(),
          status: 'active'
        }
      }
    } catch (error: any) {
      console.error('❌ Token exchange failed:', error)
      return {
        success: false,
        error: error.response?.data?.error_message || 'Failed to exchange public token'
      }
    }
  }

  /**
   * Get account information for a connected institution
   * 
   * Retrieves all accounts (checking, savings, credit cards, etc.) for a
   * connected institution with current balances and account details.
   * 
   * @param accessToken - Access token for the institution
   * @returns Promise<APIResponse> - Account list or error response
   */
  async getAccounts(accessToken: string): Promise<APIResponse<PlaidAccount[]>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'Plaid API is not configured. Please add your PLAID_CLIENT_ID and PLAID_SECRET to .env.local'
      }
    }

    try {
      const response = await this.client!.accountsGet({
        access_token: accessToken
      })

      const accounts: PlaidAccount[] = response.data.accounts.map(account => ({
        account_id: account.account_id,
        name: account.name,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
        institution_id: response.data.item.institution_id,
        balances: {
          available: account.balances.available,
          current: account.balances.current,
          limit: account.balances.limit,
          iso_currency_code: account.balances.iso_currency_code,
          unofficial_currency_code: account.balances.unofficial_currency_code
        },
        verification_status: account.verification_status
      }))

      return {
        success: true,
        data: accounts
      }
    } catch (error: any) {
      console.error('Error getting accounts:', error)
      return {
        success: false,
        error: error.response?.data?.error_message || 'Failed to get accounts'
      }
    }
  }

  /**
   * Get transaction data for a connected institution
   * 
   * Retrieves transaction history for all accounts at an institution.
   * Supports date range filtering for performance optimization.
   * 
   * @param accessToken - Access token for the institution
   * @param startDate - Optional start date for transaction range (YYYY-MM-DD)
   * @param endDate - Optional end date for transaction range (YYYY-MM-DD)
   * @returns Promise<APIResponse> - Transaction list or error response
   */
  async getTransactions(accessToken: string, startDate?: string, endDate?: string): Promise<APIResponse<Transaction[]>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'Plaid API is not configured. Please add your PLAID_CLIENT_ID and PLAID_SECRET to .env.local'
      }
    }

    try {
      // Default to last 30 days if no dates provided
      const end = endDate || new Date().toISOString().split('T')[0]
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const response = await this.client!.transactionsGet({
        access_token: accessToken,
        start_date: start,
        end_date: end,
        options: {
          include_personal_finance_category: true
        }
      })

      const transactions: Transaction[] = response.data.transactions.map(transaction => ({
        id: transaction.transaction_id,
        account_id: transaction.account_id,
        amount: transaction.amount,
        date: transaction.date,
        name: transaction.name,
        merchant_name: transaction.merchant_name,
        category: transaction.category,
        category_id: transaction.category_id,
        pending: transaction.pending,
        payment_channel: transaction.payment_channel,
        transaction_type: transaction.transaction_type,
        personal_finance_category: transaction.personal_finance_category,
        institution_id: response.data.item.institution_id
      }))

      return {
        success: true,
        data: transactions
      }
    } catch (error: any) {
      console.error('Error getting transactions:', error)
      return {
        success: false,
        error: error.response?.data?.error_message || 'Failed to get transactions'
      }
    }
  }

  /**
   * Get investment holdings for a connected institution
   * 
   * Retrieves investment account holdings including stocks, bonds, ETFs, etc.
   * with current values and cost basis information.
   * 
   * @param accessToken - Access token for the institution
   * @returns Promise<APIResponse> - Investment holdings or error response
   */
  async getInvestments(accessToken: string): Promise<APIResponse<Investment[]>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'Plaid API is not configured. Please add your PLAID_CLIENT_ID and PLAID_SECRET to .env.local'
      }
    }

    try {
      const response = await this.client!.investmentsHoldingsGet({
        access_token: accessToken
      })

      const investments: Investment[] = response.data.holdings.map(holding => ({
        security_id: holding.security.security_id,
        name: holding.security.name,
        ticker_symbol: holding.security.ticker_symbol,
        type: holding.security.type,
        institution_id: response.data.item.institution_id,
        account_id: holding.account_id,
        quantity: holding.quantity,
        cost_basis: holding.cost_basis,
        current_value: holding.institution_value,
        institution_price: holding.institution_price,
        institution_price_as_of: holding.institution_price_as_of,
        currency_code: holding.institution_price_currency_code
      }))

      return {
        success: true,
        data: investments
      }
    } catch (error: any) {
      console.error('Error getting investments:', error)
      return {
        success: false,
        error: error.response?.data?.error_message || 'Failed to get investments'
      }
    }
  }

  /**
   * Sync all data for a connected institution
   * 
   * Comprehensive method that retrieves accounts, transactions, and investments
   * for a single institution in one coordinated call. This is the primary
   * method used for data synchronization.
   * 
   * @param accessToken - Access token for the institution
   * @returns Promise<APIResponse> - Combined financial data or error response
   */
  async syncInstitutionData(accessToken: string): Promise<APIResponse<{
    accounts: PlaidAccount[]
    transactions: Transaction[]
    investments: Investment[]
  }>> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'Plaid API is not configured. Please add your API keys to .env.local'
      }
    }

    try {
      // Get all data in parallel for better performance
      const [accountsResponse, transactionsResponse, investmentsResponse] = await Promise.all([
        this.getAccounts(accessToken),
        this.getTransactions(accessToken),
        this.getInvestments(accessToken)
      ])

      // Check for errors in any of the responses
      if (!accountsResponse.success) {
        return { success: false, error: accountsResponse.error }
      }
      if (!transactionsResponse.success) {
        return { success: false, error: transactionsResponse.error }
      }
      if (!investmentsResponse.success) {
        return { success: false, error: investmentsResponse.error }
      }

      return {
        success: true,
        data: {
          accounts: accountsResponse.data,
          transactions: transactionsResponse.data,
          investments: investmentsResponse.data
        }
      }
    } catch (error: any) {
      console.error('Error syncing institution data:', error)
      return {
        success: false,
        error: error.message || 'Failed to sync institution data'
      }
    }
  }

  /**
   * Check if the service is running in demo mode
   * 
   * Demo mode is used when Plaid API keys are not configured,
   * allowing the application to function with mock data.
   * 
   * @returns boolean - True if in demo mode
   */
  isDemoMode(): boolean {
    return !this.isConnected()
  }

  /**
   * Get connection status information
   * 
   * Provides detailed status about the Plaid service configuration
   * and connection state for debugging and user feedback.
   * 
   * @returns Object with connection status and message
   */
  getConnectionStatus(): { connected: boolean; message: string } {
    if (!this.isConnected()) {
      return {
        connected: false,
        message: 'Plaid API not configured. Add PLAID_CLIENT_ID and PLAID_SECRET to .env.local to connect real bank accounts.'
      }
    }

    return {
      connected: true,
      message: 'Plaid API connected and ready for bank account integration.'
    }
  }
}

// Create singleton instance
const plaidService = new PlaidService()

/**
 * Get Plaid configuration for client-side use
 * 
 * Returns configuration object that can be safely exposed to the client
 * without revealing sensitive API keys.
 * 
 * @returns Configuration object for Plaid Link
 */
export const getPlaidConfig = () => ({
  clientId: process.env.PLAID_CLIENT_ID || '',
  secret: process.env.PLAID_SECRET || '',
  env: process.env.PLAID_ENV || 'sandbox',
  products: process.env.PLAID_PRODUCTS?.split(',') || ['transactions', 'accounts'],
  countryCodes: process.env.PLAID_COUNTRY_CODES?.split(',') || ['US'],
})

export { plaidService } 