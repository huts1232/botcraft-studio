'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) throw authError
      if (!user) {
        window.location.href = '/login'
        return
      }

      setUser(user)

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setUserProfile(profile)
      setName(profile.name || '')

      // Get organization
      if (profile.organization_id) {
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single()

        if (!orgError) {
          setOrganization(org)
        }
      }
    } catch (error: any) {
      console.error('Error loading user data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userProfile) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const { error: updateError } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id)

      if (updateError) throw updateError

      setUserProfile({ ...userProfile, name })
      setSuccess('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || !confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      setError('')

      // Delete user profile
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (deleteError) throw deleteError

      // Sign out
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error: any) {
      console.error('Error deleting account:', error)
      setError(error.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* User Profile Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={userProfile?.role || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 capitalize"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Plan Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Information</h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">Current Plan</h3>
                    <p className="text-2xl font-bold text-blue-600 capitalize">
                      {organization?.plan || 'Free'}
                    </p>
                    {organization?.plan === 'pro' && (
                      <p className="text-sm text-gray-600">$29/month</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-medium text-gray-900">{organization?.name || 'Personal'}</p>
                    {organization?.created_at && (
                      <p className="text-sm text-gray-500">
                        Since {new Date(organization.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                {organization?.plan !== 'pro' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => window.location.href = '/dashboard/settings/billing'}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Statistics */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600">Member Since</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600">Last Updated</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {userProfile?.updated_at ? new Date(userProfile.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-600">Account Status</h3>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-medium text-red-900 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. All your chatbots, 
                      conversations, and data will be permanently deleted. This action cannot be undone.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
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