'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, DollarSign, Activity, Bot, TrendingUp, AlertCircle, Search } from 'lucide-react'

// Spinner component
const Spinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
)

// Card components
const StatsCard = ({ title, value, icon, trend, description }: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: string
  description: string
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <div className="text-blue-600">
        {icon}
      </div>
    </div>
  </div>
)

const ActivityItem = ({ activity }: {
  activity: {
    id: string
    type: 'user_joined' | 'bot_created' | 'subscription_upgraded' | 'conversation_started'
    user_email: string
    description: string
    timestamp: string
  }
}) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'user_joined':
        return <Users className="h-4 w-4 text-green-600" />
      case 'bot_created':
        return <Bot className="h-4 w-4 text-blue-600" />
      case 'subscription_upgraded':
        return <DollarSign className="h-4 w-4 text-purple-600" />
      case 'conversation_started':
        return <Activity className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">{activity.user_email}</p>
        <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    revenue: 0,
    activeBots: 0,
    conversationsToday: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubscription, setSelectedSubscription] = useState('all')
  
  const router = useRouter()
  
  const supabase = useMemo(() => 
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []
  )

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin (you can modify this logic based on your admin setup)
      const adminEmails = ['admin@botcraft.studio', 'owner@botcraft.studio']
      
      if (!adminEmails.includes(user.email || '')) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      await fetchDashboardData()
    } catch (err) {
      setError('Access denied')
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch bots count
      const { count: botsCount } = await supabase
        .from('bots')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Fetch conversations today
      const today = new Date().toISOString().split('T')[0]
      const { count: conversationsToday } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)

      // Calculate revenue (assuming $49/mo for subscribed users)
      const subscribedUsers = usersData?.filter(user => 
        user.subscription_tier && user.subscription_tier !== 'free'
      ).length || 0

      setUsers(usersData || [])
      setStats({
        totalUsers: usersData?.length || 0,
        revenue: subscribedUsers * 49,
        activeBots: botsCount || 0,
        conversationsToday: conversationsToday || 0
      })

      // Generate recent activity
      const activities = []
      
      // Recent user registrations
      const recentUsers = usersData?.slice(0, 5) || []
      for (const user of recentUsers) {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_joined' as const,
          user_email: user.email,
          description: `${user.full_name || 'New user'} joined BotCraft Studio`,
          timestamp: user.created_at
        })
      }

      // Recent bot creations
      const { data: recentBots } = await supabase
        .from('bots')
        .select('*, users(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(3)

      for (const bot of recentBots || []) {
        activities.push({
          id: `bot-${bot.id}`,
          type: 'bot_created' as const,
          user_email: bot.users?.email || 'Unknown',
          description: `Created bot "${bot.name}"`,
          timestamp: bot.created_at
        })
      }

      // Sort activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setRecentActivity(activities.slice(0, 10))
      setLoading(false)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubscription = selectedSubscription === 'all' || 
                               user.subscription_tier === selectedSubscription
    return matchesSearch && matchesSubscription
  })

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError('')
              setLoading(true)
              fetchDashboardData()
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">BotCraft Studio Administration</p>
            </div>
            <Link 
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            icon={<Users className="h-8 w-8" />}
            trend="+12% this month"
            description="Registered users"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={<DollarSign className="h-8 w-8" />}
            trend="+8% this month"
            description="From subscriptions"
          />
          <StatsCard
            title="Active Bots"
            value={stats.activeBots.toString()}
            icon={<Bot className="h-8 w-8" />}
            description="Currently active"
          />
          <StatsCard
            title="Conversations Today"
            value={stats.conversationsToday.toString()}
            icon={<Activity className="h-8 w-8" />}
            description="Bot interactions"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedSubscription}
                    onChange={(e) => setSelectedSubscription(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Plans</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name || 'Unnamed User'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.subscription_tier === 'pro' 
                              ? 'bg-blue-100 text-blue-800'
                              : user.subscription_tier === 'enterprise'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.subscription_tier || 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <p className="text-center text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}