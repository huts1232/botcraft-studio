'use client'
import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Bot, MessageCircle, Users, BarChart3, Settings, Plus, TrendingUp, Activity, User } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  company_name: string
  subscription_plan: string
  created_at: string
}

interface BotData {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
}

interface Stats {
  totalBots: number
  activeBots: number
  totalConversations: number
  totalLeads: number
}

export default function Dashboard() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const [user, setUser] = useState<User | null>(null)
  const [bots, setBots] = useState<BotData[]>([])
  const [stats, setStats] = useState<Stats>({ totalBots: 0, activeBots: 0, totalConversations: 0, totalLeads: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userData) setUser(userData)

      // Get bots data
      const { data: botsData } = await supabase
        .from('bots')
        .select('id, name, description, is_active, created_at')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (botsData) setBots(botsData)

      // Get stats
      const totalBots = botsData?.length || 0
      const activeBots = botsData?.filter(bot => bot.is_active).length || 0

      const { count: conversationCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .in('bot_id', botsData?.map(bot => bot.id) || [])

      const { count: leadCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('bot_id', botsData?.map(bot => bot.id) || [])

      setStats({
        totalBots,
        activeBots,
        totalConversations: conversationCount || 0,
        totalLeads: leadCount || 0
      })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBot = () => {
    window.location.href = '/dashboard/bots'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BotCraft Studio</span>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-6">
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/bots"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <Bot className="mr-3 h-5 w-5" />
                Bots
              </Link>
              <Link
                href="/dashboard/conversations"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                Conversations
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </div>
          </div>
        </nav>

        <div className="mt-8 px-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Subscription Plan</h3>
            <p className="text-sm text-blue-700 mt-1">{user?.subscription_plan || 'Free'}</p>
            <p className="text-xs text-blue-600 mt-2">$29/mo for Pro features</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.full_name || 'there'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's an overview of your chatbots and their performance.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bots</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBots}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bots</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeBots}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalConversations}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bots */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Bots</h2>
                <button
                  onClick={handleCreateBot}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bot
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              {bots.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bots yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first chatbot.</p>
                  <div className="mt-6">
                    <button
                      onClick={handleCreateBot}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Bot
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
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
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bots.map((bot) => (
                        <tr key={bot.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Bot className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{bot.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{bot.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              bot.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {bot.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(bot.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/dashboard/bots/${bot.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
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
      </div>
    </div>
  )
}