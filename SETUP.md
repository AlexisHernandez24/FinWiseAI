# FinWiseAI Setup Guide

This guide will help you set up FinWiseAI with real Plaid and OpenAI integrations for a fully functional financial management application.

## 🚀 Quick Start (Demo Mode)

FinWiseAI works out of the box with demo data! Just run:

```bash
npm run dev
```

The app will run in demo mode with:
- Mock financial data from Plaid
- AI insights generated using fallback logic
- All features functional for testing

## 🔧 Production Setup

To connect to real financial institutions and use AI insights, you'll need to set up API keys.

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Plaid API Configuration
PLAID_CLIENT_ID=your_plaid_client_id_here
PLAID_SECRET=your_plaid_secret_here
PLAID_ENV=sandbox
PLAID_PRODUCTS=transactions,accounts,identity,investments
PLAID_COUNTRY_CODES=US

# OpenAI API Configuration  
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# NextJS Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# App Configuration
APP_ENV=development
```

### 2. Plaid Integration Setup

#### Step 1: Create Plaid Account
1. Go to [Plaid Dashboard](https://dashboard.plaid.com/signup)
2. Sign up for a free developer account
3. Complete the verification process

#### Step 2: Get API Keys
1. Navigate to **Team Settings > Keys**
2. Copy your `client_id` and `secret` for Sandbox environment
3. Add them to your `.env.local` file

#### Step 3: Configure Products
In your Plaid dashboard:
1. Go to **Team Settings > Allowed products**
2. Enable: **Transactions**, **Accounts**, **Identity**, **Investments**

#### Step 4: Test Connection
```bash
# The app will automatically detect your Plaid keys
# Look for "🔗 Plaid: Connected" in the console
npm run dev
```

### 3. OpenAI Integration Setup

#### Step 1: Create OpenAI Account
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Add billing information (required for API access)

#### Step 2: Generate API Key
1. Navigate to **Settings > API Keys**
2. Click **Create new secret key**
3. Copy the key and add it to your `.env.local` file

#### Step 3: Test AI Features
```bash
# The app will automatically detect your OpenAI key
# Look for "🤖 OpenAI: Connected" in the console
npm run dev
```

## 📱 Features Overview

### With Plaid Integration
- **Real Bank Connections**: Connect checking, savings, credit cards, investments
- **Live Transaction Data**: Automatically sync transactions from connected accounts
- **Account Balances**: Real-time balance updates
- **Investment Holdings**: Track stocks, bonds, ETFs, crypto

### With OpenAI Integration
- **Smart Insights**: AI-powered financial recommendations
- **Spending Analysis**: Personalized spending pattern analysis
- **Goal Recommendations**: AI suggestions for achieving financial goals
- **Risk Assessment**: Intelligent portfolio and spending risk analysis

### Core Features (Always Available)
- **Financial Goals**: Set and track savings, debt payoff, investment goals
- **Budget Management**: Create and monitor budgets by category
- **Portfolio Analysis**: Investment tracking and performance metrics
- **Retirement Planning**: Retirement calculators and projections
- **Scenario Analysis**: "What-if" financial modeling
- **Professional UI**: Modern, responsive design

## 🛡️ Security & Privacy

### Data Protection
- **Bank-Level Security**: All financial data encrypted with 256-bit SSL
- **No Credential Storage**: Banking credentials never stored on our servers
- **Local Storage**: User data stored locally in browser (not on external servers)
- **API Security**: All API requests secured with proper authentication

### Plaid Security
- **Read-Only Access**: Plaid provides read-only access to your accounts
- **No Transaction Capability**: Cannot initiate transfers or payments
- **Institutional Security**: Same security standards as major banks
- **Revocable Access**: Disconnect accounts anytime from settings

## 🔧 Development

### Environment Modes

#### Demo Mode (Default)
- No API keys required
- Uses realistic mock data
- All features functional for development
- Perfect for testing and development

#### Sandbox Mode (Plaid + OpenAI)
- Test with real API integration
- Plaid Sandbox environment (fake bank accounts)
- OpenAI development usage
- Safe for development and testing

#### Production Mode
- Real bank connections through Plaid
- Full OpenAI capabilities
- Production-ready deployment
- Requires additional Plaid verification

### API Rate Limits

#### Plaid (Sandbox)
- 100 requests per minute
- 1,000 requests per day
- No cost for development

#### OpenAI
- Depends on your plan
- GPT-4: ~$0.03 per 1K tokens
- Typical insight generation: $0.01-0.05

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables for Production
```bash
PLAID_CLIENT_ID=prod_client_id
PLAID_SECRET=prod_secret
PLAID_ENV=production
OPENAI_API_KEY=your_production_key
NEXTAUTH_SECRET=secure_random_string
NEXTAUTH_URL=https://your-domain.com
```

## 🆘 Troubleshooting

### Common Issues

#### Plaid Connection Failed
- Check your `PLAID_CLIENT_ID` and `PLAID_SECRET`
- Ensure you're using the correct environment (`sandbox` vs `production`)
- Verify products are enabled in Plaid dashboard

#### OpenAI Insights Not Working
- Verify your `OPENAI_API_KEY` is correct
- Check you have sufficient credits in your OpenAI account
- Try using `gpt-3.5-turbo` instead of `gpt-4` for lower costs

#### App Running in Demo Mode
- App automatically falls back to demo mode if API keys are missing
- Check your `.env.local` file exists and has correct values
- Restart the development server after adding environment variables

### Need Help?

1. **Check Console**: Look for connection status messages
2. **Demo Mode**: App works fully without any setup
3. **Documentation**: Both Plaid and OpenAI have excellent docs
4. **Community**: Join discussions in the repository

## 📈 Next Steps

Once you have FinWiseAI running:

1. **Connect Your Bank**: Use the "Connect Account" feature
2. **Set Financial Goals**: Create savings and investment goals
3. **Review AI Insights**: Check the AI recommendations
4. **Explore Features**: Try budget management, portfolio analysis
5. **Customize**: Modify goals and preferences to match your needs

---

**Happy Financial Planning! 💰📊🎯** 