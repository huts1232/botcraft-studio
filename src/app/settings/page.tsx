'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User, Settings, CreditCard, Trash2, Save, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    company_name: '',
    subscription_plan: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      
      setUser(user)
      
      if (user) {
        // Get user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (userError) {
          console.error('User profile error:', userError)
        }
        
        setProfile({
          full_name: userData?.full_name || '',
          email: user.email || '',
          company_name: userData?.company_name || '',
          subscription_plan: userData?.subscription_plan || 'free'
        })
      }
    } catch (err: any) {
      console.error('Error fetching user data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      if (!user?.id) return
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: profile.email,
          full_name: profile.full_name,
          company_name: profile.company_name,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      setSuccess('Profile updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    
    setDeleting(true)
    setError('')
    
    try {
      if (!user?.id) return
      
      // Delete user data from our database
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
      
      if (deleteError) throw deleteError
      
      // Sign out the user
      await supabase.auth.signOut()
      
      // Redirect to home page
      window.location.href = '/'
    } catch (err: any) {
      console.error('Error deleting account:', err)
      setError(err.message)
      setDeleting(false)
    }
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Pro Plan'
      case 'enterprise': return 'Enterprise Plan'
      default: return 'Free Plan'
    }
  }

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'pro': return '$29/month'
      case 'enterprise': return 'Custom pricing'
      default: return '$0/month'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <User className="h-5 w-5 text-gray-600" />
                Profile Information
              </h2>
              <p className="mt-1 text-gray-600">
                Update your personal information and contact details
              </p>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="Enter your email"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  value={profile.company_name}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your company name (optional)"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Plan Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                Subscription Plan
              </h2>
              <p className="mt-1 text-gray-600">
                View and manage your subscription plan
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {getPlanName(profile.subscription_plan)}
                  </h3>
                  <p className="text-gray-600">{getPlanPrice(profile.subscription_plan)}</p>
                </div>
                
                <div className="flex gap-3">
                  {profile.subscription_plan === 'free' && (
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upgrade Plan
                    </button>
                  )}
                  {profile.subscription_plan !== 'free' && (
                    <button
                      onClick={() => window.location.href = '/billing'}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Manage Billing
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {profile.subscription_plan === 'free' ? '1' : profile.subscription_plan === 'pro' ? '10' : 'Unlimited'}
                  </div>
                  <div className="text-sm text-gray-600">Chatbots</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {profile.subscription_plan === 'free' ? '100' : profile.subscription_plan === 'pro' ? '10,000' : 'Unlimited'}
                  </div>
                  <div className="text-sm text-gray-600">Messages/month</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {profile.subscription_plan === 'free' ? '1' : profile.subscription_plan === 'pro' ? '5' : 'Unlimited'}
                  </div>
                  <div className="text-sm text-gray-600">Integrations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-xl font-semibold text-red-900 flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-red-600" />
                Danger Zone
              </h2>
              <p className="mt-1 text-red-600">
                Irreversible and destructive actions
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
                  <p className="text-red-600">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}