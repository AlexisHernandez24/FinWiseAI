'use client'

import { User, Shield, Bell, Link, Database, Settings as SettingsIcon, Save, X, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'

export default function SettingsPage() {
  const { user, setUser, clearUser, connectedInstitutions } = useFinancialStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    if (user) {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        updatedAt: new Date()
      })
    }
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all financial data? This action cannot be undone.')) {
      clearUser()
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-700 rounded-2xl"></div>
        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
        <div className="relative p-8 lg:p-12 text-white">
          <div className="flex items-center space-x-2 mb-4">
            <SettingsIcon className="h-8 w-8 text-white" />
            <div className="flex items-center space-x-2 text-white/80 text-sm">
              <User className="h-4 w-4" />
              <span>Account & Preferences</span>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Settings
          </h1>
          <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
            Manage your account settings, security preferences, and data connections.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-slate-600" />
              <h3 className="text-xl font-bold text-slate-900">Profile Settings</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-semibold text-slate-900 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-slate-600">Member Since</span>
                    <p className="font-medium text-slate-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Last Updated</span>
                    <p className="font-medium text-slate-900">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-slate-600" />
              <h3 className="text-xl font-bold text-slate-900">Security</h3>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-slate-900 mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-700">Secure your account with 2FA</p>
                    <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                  </div>
                  <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50 card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="h-6 w-6 text-slate-600" />
              <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
            </div>
            <div className="space-y-6">
              {[
                { name: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when you exceed budget limits' },
                { name: 'investmentAlerts', label: 'Investment Alerts', description: 'Market changes and portfolio updates' },
                { name: 'aiInsights', label: 'AI Insights', description: 'Personalized financial recommendations' },
                { name: 'dataSync', label: 'Data Sync', description: 'Account synchronization updates' }
              ].map((setting) => (
                <div key={setting.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{setting.label}</p>
                    <p className="text-sm text-slate-500">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={Boolean(user?.preferences?.[setting.name as keyof typeof user.preferences]) || false}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          
          {/* Connected Accounts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <div className="flex items-center space-x-3 mb-4">
              <Link className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-bold text-slate-900">Connected Accounts</h3>
            </div>
            {connectedInstitutions.length > 0 ? (
              <div className="space-y-3">
                {connectedInstitutions.map((institution) => (
                  <div key={institution.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{institution.institution_name}</p>
                      <p className="text-xs text-slate-500">
                        {institution.accounts.length} account{institution.accounts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      institution.sync_status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Link className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-600">No accounts connected</p>
              </div>
            )}
          </div>

          {/* Data & Privacy */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-bold text-slate-900">Data & Privacy</h3>
            </div>
            <div className="space-y-4">
              <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <p className="text-sm font-medium text-slate-900">Export Data</p>
                <p className="text-xs text-slate-500">Download your financial data</p>
              </button>
              
              <div className="border-t pt-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-slate-900">Data Sharing</p>
                  <p className="text-xs text-slate-500">Control how your data is used</p>
                </div>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Allow anonymous analytics</span>
                </label>
              </div>
              
              <div className="border-t pt-4">
                <button 
                  onClick={handleClearData}
                  className="w-full p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-red-700"
                >
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs">Permanently delete your account and data</p>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 card-hover">
            <div className="space-y-3">
              <button 
                onClick={handleSaveProfile}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span className="font-medium">Save Changes</span>
              </button>
              
              <button className="w-full bg-white border-2 border-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center justify-center space-x-2">
                <X className="h-4 w-4" />
                <span className="font-medium">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 