'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [stats, setStats] = useState({ totalChatbots: 0, totalOrganizations: 0, totalMessages: 0 })

  const supabase = useMemo(() => 
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), 
    []
  )

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [chatbotsRes, orgsRes, messagesRes] = await Promise.all([
        supabase.from('chatbots').select('id', { count: 'exact', head: true }),
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true })
      ])

      setStats({
        totalChatbots: chatbotsRes.count || 0,
        totalOrganizations: orgsRes.count || 0,
        totalMessages: messagesRes.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: '🤖',
      title: 'No-Code Chatbot Builder',
      description: 'Create intelligent chatbots without writing a single line of code using our visual flow builder.'
    },
    {
      icon: '📚',
      title: 'Knowledge Base Training',
      description: 'Upload documents, PDFs, and websites to train your chatbot with your specific knowledge.'
    },
    {
      icon: '🔄',
      title: 'Visual Flow Designer',
      description: 'Design complex conversation flows with drag-and-drop interface and conditional logic.'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track conversations, user satisfaction, and chatbot performance with detailed analytics.'
    },
    {
      icon: '🌐',
      title: 'Multi-Channel Deployment',
      description: 'Deploy your chatbots on websites, messaging apps, and social media platforms.'
    },
    {
      icon: '⚡',
      title: 'Real-Time Responses',
      description: 'Lightning-fast responses powered by advanced AI models and optimized infrastructure.'
    }
  ]

  const pricingFeatures = [
    'Unlimited chatbots',
    'Advanced knowledge base',
    'Visual flow builder',
    'Multi-channel deployment',
    'Real-time analytics',
    'API access',
    'Priority support',
    'Custom integrations'
  ]

  const testimonialsList = [
    {
      name: 'Sarah Johnson',
      company: 'TechStart Inc.',
      content: 'BotCraft Studio transformed our customer support. We reduced response time by 80% and improved satisfaction scores significantly.',
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      company: 'Digital Solutions',
      content: 'The no-code approach made it easy for our entire team to create and maintain chatbots. Game-changer for our business.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Rodriguez',
      company: 'E-Commerce Plus',
      content: 'Our sales increased by 35% after implementing chatbots built with BotCraft Studio. The ROI was immediate.',
      avatar: '👩‍🚀'
    }
  ]

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = '/dashboard'
  }

  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BotCraft Studio
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</Link>
              <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-12 mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Train Custom{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chatbots
              </span>
              <br />
              Without Coding
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create intelligent, conversational AI chatbots using our visual no-code platform. 
              Train them with your knowledge base and deploy across multiple channels instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Start Building Free
              </button>
              <button
                onClick={handleLearnMore}
                className="text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:text-gray-900 transition-colors"
              >
                Learn More →
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? '...' : stats.totalChatbots.toLocaleString()}+
              </div>
              <div className="text-gray-600">Chatbots Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? '...' : stats.totalOrganizations.toLocaleString()}+
              </div>
              <div className="text-gray-600">Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? '...' : (stats.totalMessages / 1000).toFixed(1)}K+
              </div>
              <div className="text-gray-600">Messages Processed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, train, and deploy intelligent chatbots that deliver exceptional user experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            One plan with everything you need. No hidden fees, no limits.
          </p>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for businesses of all sizes</p>
            </div>

            <div className="mb-8">
              <ul className="space-y-4">
                {pricingFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center justify-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Your Free Trial
            </button>
            
            <p className="text-sm text-gray-500 mt-4">14-day free trial. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about BotCraft Studio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsList.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build Your First Chatbot?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using BotCraft Studio to automate customer support, 
            generate leads, and improve user engagement.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Get Started Today - It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                BotCraft Studio
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Train custom chatbots without coding. Build, deploy, and scale intelligent 
                conversational AI for your business.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 BotCraft Studio. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}