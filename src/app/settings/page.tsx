'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Crown, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (profile) {
        setUserProfile(profile)
        setFormData({
          full_name: profile.full_name || '',
          email: profile.email || user.email || ''
        })
      } else {
        // Create user profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            subscription_tier: 'free'
          }])
          .select()
          .single()

        if (createError) throw createError
        
        setUserProfile(newProfile)
        setFormData({
          full_name: newProfile.full_name || '',
          email: newProfile.email || ''
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setUpdating(true)
    setError('')
    setSuccess('')

    try {
      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: formData.email,
        data: { full_name: formData.full_name }
      })

      if (authError) throw authError

      setSuccess('Profile updated successfully!')
      
      // Refresh user profile
      await checkUser()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your bots, conversations, and data.')) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      // Delete all user's bots and related data
      const { data: userBots } = await supabase
        .from('bots')
        .select('id')
        .eq('user_id', user.id)

      if (userBots && userBots.length > 0) {
        const botIds = userBots.map(bot => bot.id)

        // Delete in order due to foreign key constraints
        await supabase.from('messages').delete().in('conversation_id', 
          await supabase.from('conversations').select('id').in('bot_id', botIds).then(res => res.data?.map(c => c.id) || [])
        )
        await supabase.from('conversations').delete().in('bot_id', botIds)
        await supabase.from('handoff_requests').delete().in('bot_id', botIds)
        await supabase.from('analytics_events').delete().in('bot_id', botIds)
        await supabase.from('deployment_channels').delete().in('bot_id', botIds)
        await supabase.from('conversation_flows').delete().in('bot_id', botIds)
        await supabase.from('knowledge_bases').delete().in('bot_id', botIds)
        await supabase.from('bots').delete().in('id', botIds)
      }

      // Delete user profile
      await supabase.from('users').delete().eq('id', user.id)

      // Delete auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
      if (deleteError) throw deleteError

      // Sign out
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: any) {
      setError(err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link 
                href="/dashboard"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <div className="space-y-8">
          {/* User Profile Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">User Profile</h2>
              </div>
            </div>
            <div className="px-6 py-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {updating ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Plan Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Subscription Plan</h2>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {userProfile?.subscription_tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userProfile?.subscription_tier === 'pro' 
                      ? '$49/month - Unlimited bots, advanced features, priority support'
                      : 'Limited features - Upgrade for unlimited access'
                    }
                  </p>
                </div>
                {userProfile?.subscription_tier !== 'pro' && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white shadow rounded-lg border border-red-200">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <div className="flex items-center">
                <Trash2 className="w-5 h-5 text-red-600 mr-2" />
                <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
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