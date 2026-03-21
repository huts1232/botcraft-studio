'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Users, Bot, DollarSign, Activity, TrendingUp, Calendar, Search, Filter } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  company_name: string
  subscription_plan: string
  created_at: string
  updated_at: string
}

interface Bot {
  id: string
  user_id: string
  name: string
  is_active: boolean
  created_at: string
}

interface Conversation {
  id: string
  bot_id: string
  platform: string
  status: string
  created_at: string
}

interface Stats {
  totalUsers: number
  totalBots: number
  monthlyRevenue: number
  activeConversations: number
  newUsersThisMonth: number
  botsCreatedThisMonth: number
}

interface ActivityItem {
  id: string
  type: 'user_signup' | 'bot_created' | 'conversation_started'
  user_email: string
  description: string
  timestamp: string
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
)

const LoadingCard = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded"></div>
    </div>
  </div>
)

export default function AdminPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Load bots for stats
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select('id, user_id, name, is_active, created_at')

      if (botsError) throw botsError

      // Load conversations for stats
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, bot_id, platform, status, created_at')

      if (conversationsError) throw conversationsError

      setUsers(usersData || [])

      // Calculate stats
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const newUsersThisMonth = (usersData || []).filter(user => 
        new Date(user.created_at) >= firstDayOfMonth
      ).length

      const botsCreatedThisMonth = (botsData || []).filter(bot => 
        new Date(bot.created_at) >= firstDayOfMonth
      ).length

      const activeConversations = (conversationsData || []).filter(conv => 
        conv.status === 'active'
      ).length

      // Calculate monthly revenue (assuming $29/mo for all users)
      const totalUsers = (usersData || []).length
      const monthlyRevenue = totalUsers * 29

      setStats({
        totalUsers,
        totalBots: (botsData || []).length,
        monthlyRevenue,
        activeConversations,
        newUsersThisMonth,
        botsCreatedThisMonth
      })

      // Generate recent activity
      const activity: ActivityItem[] = []

      // Add recent user signups
      const recentUsers = (usersData || []).slice(0, 10)
      recentUsers.forEach(user => {
        activity.push({
          id: `user-${user.id}`,
          type: 'user_signup',
          user_email: user.email,
          description: `${user.full_name || user.email} signed up`,
          timestamp: user.created_at
        })
      })

      // Add recent bot creations
      const recentBots = (botsData || []).slice(0, 10)
      recentBots.forEach(bot => {
        const user = usersData?.find(u => u.id === bot.user_id)
        activity.push({
          id: `bot-${bot.id}`,
          type: 'bot_created',
          user_email: user?.email || 'Unknown',
          description: `Created bot "${bot.name}"`,
          timestamp: bot.created_at
        })
      })

      // Add recent conversations
      const recentConversations = (conversationsData || []).slice(0, 10)
      recentConversations.forEach(conv => {
        const bot = botsData?.find(b => b.id === conv.bot_id)
        const user = bot ? usersData?.find(u => u.id === bot.user_id) : null
        activity.push({
          id: `conv-${conv.id}`,
          type: 'conversation_started',
          user_email: user?.email || 'Unknown',
          description: `Started conversation on ${conv.platform}`,
          timestamp: conv.created_at
        })
      })

      // Sort activity by timestamp
      activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activity.slice(0, 20))

    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesPlan = !selectedPlan || user.subscription_plan === selectedPlan
    
    return matchesSearch && matchesPlan
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <Users className="h-4 w-4 text-green-600" />
      case 'bot_created':
        return <Bot className="h-4 w-4 text-blue-600" />
      case 'conversation_started':
        return <Activity className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-blue-100 text-blue-800'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Monitor users, bots, and system activity</p>
          </div>

          {/* Loading Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>

          {/* Loading Table */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              loadData()
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor users, bots, and system activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-green-600">+{stats?.newUsersThisMonth || 0} this month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bots</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBots || 0}</p>
                <p className="text-sm text-blue-600">+{stats?.botsCreatedThisMonth || 0} this month</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.monthlyRevenue?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  Growing
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeConversations || 0}</p>
                <p className="text-sm text-purple-600">Live now</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Table */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 sm:mb-0">Users</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Plans</option>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || selectedPlan ? 'Try adjusting your filters' : 'Users will appear here when they sign up'}
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.company_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadgeColor(user.subscription_plan)}`}>
                              {user.subscription_plan || 'free'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {activity.user_email} • {formatDateTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}