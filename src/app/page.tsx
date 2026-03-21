'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle, Bot, MessageSquare, Database, Zap, Shield, Users, ArrowRight, Star, Menu, X } from 'lucide-react'

// Utility function for classNames
const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Spinner component
const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
)

// Button component
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false 
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 disabled:border-gray-200 disabled:text-gray-400"
  }
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  )
}

// Card component
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)}>
    {children}
  </div>
)

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [statsData, setStatsData] = useState({ bots: 0, conversations: 0, users: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = useMemo(() => 
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), []
  )

  useEffect(() => {
    fetchData()
  }, [supabase])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const [botsResult, conversationsResult, usersResult] = await Promise.all([
        supabase.from('bots').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true })
      ])

      setStatsData({
        bots: botsResult.count || 0,
        conversations: conversationsResult.count || 0,
        users: usersResult.count || 0
      })

      // Mock testimonials (in real app, these would come from a testimonials table)
      setTestimonials([
        {
          id: 1,
          name: "Sarah Johnson",
          role: "CEO, TechStart",
          content: "BotCraft Studio helped us create a customer support bot that handles 80% of our inquiries automatically. Game changer!",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=64&h=64&fit=crop&crop=face",
          rating: 5
        },
        {
          id: 2,
          name: "Marcus Chen",
          role: "Operations Manager",
          content: "The no-code approach made it easy for our team to build and deploy chatbots without technical expertise.",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
          rating: 5
        },
        {
          id: 3,
          name: "Emily Rodriguez",
          role: "Marketing Director",
          content: "Our lead qualification improved by 300% after implementing BotCraft Studio on our website.",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
          rating: 5
        }
      ])

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleGetStarted = () => {
    window.location.href = '/auth/login'
  }

  const handleStartTrial = () => {
    window.location.href = '/auth/login'
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BotCraft Studio</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</Link>
            </nav>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Button onClick={handleGetStarted}>Get Started</Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-600">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                <Link href="#features" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Features</Link>
                <Link href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Pricing</Link>
                <Link href="#testimonials" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Testimonials</Link>
                <Link href="/auth/login" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
                <div className="px-3 py-2">
                  <Button onClick={handleGetStarted} size="sm" className="w-full">Get Started</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Build Intelligent{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chatbots
              </span>
              <br />
              From Your Data
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              No coding required. Transform your documents, websites, and knowledge base into powerful AI chatbots that engage customers and automate support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button onClick={handleStartTrial} size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
              >
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900">{statsData.bots.toLocaleString()}+</div>
                <div className="text-gray-600">Bots Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{statsData.conversations.toLocaleString()}+</div>
                <div className="text-gray-600">Conversations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{statsData.users.toLocaleString()}+</div>
                <div className="text-gray-600">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Build Amazing Chatbots
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From data ingestion to deployment, BotCraft Studio provides all the tools you need to create intelligent conversational AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Knowledge Base</h3>
              <p className="text-gray-600">
                Upload documents, PDFs, and web content. Our AI automatically processes and structures your data for optimal chatbot training.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Conversation Flows</h3>
              <p className="text-gray-600">
                Design sophisticated conversation paths with our visual flow builder. No coding skills required.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Channel Deployment</h3>
              <p className="text-gray-600">
                Deploy your bots across websites, social media, messaging apps, and more with one-click integration.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600">
                Bank-level encryption, GDPR compliance, and secure data processing ensure your information stays protected.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Human Handoff</h3>
              <p className="text-gray-600">
                Seamlessly transfer conversations to human agents when needed, with full context and conversation history.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Bot className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600">
                Track performance, user satisfaction, and conversation insights with comprehensive analytics dashboards.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="p-8 relative">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">1 Chatbot</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">100 messages/month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Basic knowledge base</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Website integration</span>
                </li>
              </ul>
              <Button onClick={handleStartTrial} variant="outline" className="w-full">
                Get Started Free
              </Button>
            </Card>

            {/* Professional Plan */}
            <Card className="p-8 relative border-2 border-blue-500">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$49</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">5 Chatbots</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">10,000 messages/month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced knowledge base</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Multi-channel deployment</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Human handoff</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Analytics dashboard</span>
                </li>
              </ul>
              <Button onClick={handleStartTrial} className="w-full">
                Start 14-day Trial
              </Button>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 relative">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited chatbots</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited messages</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced security</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Dedicated support</span>
                </li>
              </ul>
              <Button 
                onClick={() => window.location.href = 'mailto:sales@botcraft.studio'}
                variant="outline" 
                className="w-full"
              >
                Contact Sales
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Teams Everywhere
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers are saying about BotCraft Studio.
            </p>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No testimonials available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Customer Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of businesses using BotCraft Studio to automate support, engage customers, and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleStartTrial}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => window.location.href = 'mailto:demo@botcraft.studio'}
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">BotCraft Studio</span>
              </div>
              <p className="text-gray-400 mb-4">
                Build intelligent chatbots from your data, no coding required.
              </p>
              <div className="text-sm text-gray-400">
                © 2024 BotCraft Studio. All rights reserved.
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:help@botcraft.studio" className="hover:text-white">Help Center</a></li>
                <li><a href="mailto:support@botcraft.studio" className="hover:text-white">Contact Support</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                Made with ❤️ for businesses who want to scale their customer support.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5