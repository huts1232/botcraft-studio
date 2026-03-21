'use client'
import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Home, Bot, Settings, Plus, Activity, Users, MessageSquare, TrendingUp, Clock, AlertCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  subscription_tier: string
  created_at: string
  updated_at: string
}

interface Bot {
  id: string
  user_id: string
  name: string
  description: string
  avatar_url: string | null
  personality: string
  status: string
  fallback_message: string
  handoff_enabled: boolean
  created_at: string
  updated_at: string
}

interface Stats {
  totalBots: number
  totalConversations: number
  totalMessages: number
  activeConversations: number
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
)

const LoadingCard = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
  </div>
)

export default function Dashboard() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  
  const [user, setUser] = useState<User | null>(null)
  const [bots, setBots] = useState<Bot[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        throw new Error('Not authenticated')
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) throw userError
      setUser(userData)
    } catch (err) {
      console.error('Error fetching user:', err)
      setError('Failed to load user data')
    }
  }

  const fetchBots = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBots(data || [])
    } catch (err) {
      console.error('Error fetching bots:', err)
      setError('Failed to load bots')
    }
  }

  const fetchStats = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        throw new Error('Not authenticated')
      }

      // Get total bots count
      const { count: botsCount } = await supabase
        .from('bots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id)

      // Get user's bot IDs for filtering
      const { data: userBots } = await supabase
        .from('bots')
        .select('id')
        .eq('user_id', authUser.id)

      const botIds = userBots?.map(bot => bot.id) || []

      if (botIds.length === 0) {
        setStats({
          totalBots: 0,
          totalConversations: 0,
          totalMessages: 0,
          activeConversations: 0
        })
        return
      }

      // Get conversations count
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .in('bot_id', botIds)

      // Get messages count
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .in('bot_id', botIds)

      const conversationIds = conversations?.map(conv => conv.id) || []
      
      let messagesCount = 0
      if (conversationIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
        messagesCount = count || 0
      }

      // Get active conversations count
      const { count: activeConversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .in('bot_id', botIds)
        .eq('status', 'active')

      setStats({
        totalBots: botsCount || 0,
        totalConversations: conversationsCount || 0,
        totalMessages: messagesCount,
        activeConversations: activeConversationsCount || 0
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      await Promise.all([
        fetchUserData(),
        fetchBots(),
        fetchStats()
      ])
      setLoading(false)
    }

    loadDashboard()
  }, [supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'training':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">BotCraft Studio</h2>
          </div>
          <nav className="mt-6">
            <Link href="/dashboard" className="flex items-center px-6 py-3 text-blue-600 bg-blue-50 border-r-2 border-blue-600">
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link href="/dashboard/bots" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
              <Bot className="mr-3 h-5 w-5" />
              Bots
            </Link>
            <Link href="/dashboard/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <LoadingCard key={i} />
              ))}
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
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
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">BotCraft Studio</h2>
        </div>
        <nav className="mt-6">
          <Link href="/dashboard" className="flex items-center px-6 py-3 text-blue-600 bg-blue-50 border-r-2 border-blue-600">
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/dashboard/bots" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
            <Bot className="mr-3 h-5 w-5" />
            Bots
          </Link>
          <Link href="/dashboard/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </nav>
        
        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-6 border-t">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.subscription_tier || 'free'} plan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your chatbot performance and recent activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Bots</p>
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalBots || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Conversations</p>
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalConversations || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalMessages || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeConversations || 0}</p>
          </div>
        </div>

        {/* Bots Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Bots</h2>
            <Link 
              href="/dashboard/bots/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Bot
            </Link>
          </div>
          
          {bots.length === 0 ? (
            <div className="p-12 text-center">
              <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bots yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first chatbot to get started with BotCraft Studio.
              </p>
              <Link 
                href="/dashboard/bots/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Bot
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bots.map((bot) => (
                    <tr key={bot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                            {bot.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{bot.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {bot.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bot.status)}`}>
                          {bot.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(bot.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          href={`/dashboard/bots/${bot.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/dashboard/bots/${bot.id}/analytics`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Analytics
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}