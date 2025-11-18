'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  Send, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Trophy,
  Award,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Client } from '@/lib/types'
import { getClients } from '@/lib/supabase/db'

// Define type for KPI data
interface KpiItem {
  title: string
  value: string
  change: string
  icon: React.ReactNode
}

// Mock data for the charts
const chartData = [
  { name: 'Jan', clients: 4, revenue: 24000 },
  { name: 'Feb', clients: 3, revenue: 13980 },
  { name: 'Mar', clients: 2, revenue: 98000 },
  { name: 'Apr', clients: 5, revenue: 39080 },
  { name: 'May', clients: 6, revenue: 48000 },
  { name: 'Jun', clients: 3, revenue: 38000 },
  { name: 'Jul', clients: 7, revenue: 65000 },
  { name: 'Aug', clients: 8, revenue: 72000 },
  { name: 'Sep', clients: 6, revenue: 58000 },
  { name: 'Oct', clients: 9, revenue: 81000 },
  { name: 'Nov', clients: 12, revenue: 95000 },
  { name: 'Dec', clients: 15, revenue: 120000 },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const router = useRouter()
  
  // Get latest 3 clients for the dashboard
  const latestClients = clients.slice(0, 3)

  // Calculate mock revenue data for clients (since there's no revenue field in the schema)
  const clientsWithRevenue = useMemo(() => clients.map(client => ({
    ...client,
    revenue: Math.floor(Math.random() * 10000) + 1000 // Random revenue between $1,000 and $10,000
  })).sort((a, b) => b.revenue - a.revenue), [clients])

  // Calculate total revenue
  const totalRevenue = useMemo(() => clientsWithRevenue.reduce((sum, client) => sum + client.revenue, 0), [clientsWithRevenue])

  // Get top client
  const topClient = useMemo(() => clientsWithRevenue[0], [clientsWithRevenue])

  // Get top 3 clients
  const top3Clients = useMemo(() => clientsWithRevenue.slice(0, 3), [clientsWithRevenue])

  // Calculate outreach frequency (mock data)
  const outreachCount = useMemo(() => clients.filter(client => client.outreach_date).length, [clients])
  const outreachPerDay = useMemo(() => outreachCount > 0 ? outreachCount / 7 : 0, [outreachCount]) // Assuming 7 days

  // Suggested hire logic
  const suggestedHire = useMemo(() => {
    if (totalRevenue > 50000 && outreachPerDay >= 3) {
      return 'Sales Assistant'
    } else if (totalRevenue > 30000 && outreachPerDay >= 2) {
      return 'Project Manager'
    } else if (totalRevenue > 15000) {
      return 'Junior Editor'
    }
    return 'Editor'
  }, [totalRevenue, outreachPerDay])

  // Allocation split
  const allocation = useMemo(() => ({
    operations: { percentage: 40, amount: totalRevenue * 0.4 },
    payroll: { percentage: 30, amount: totalRevenue * 0.3 },
    growth: { percentage: 20, amount: totalRevenue * 0.2 },
    savings: { percentage: 10, amount: totalRevenue * 0.1 }
  }), [totalRevenue])

  // Time estimate for top client
  const timeEstimate = useMemo(() => {
    if (!topClient) return '5-10 hours'
    return topClient.status === 'ongoing' ? '20-30 hours' : 
           topClient.status === 'active' ? '10-15 hours' : 
           '5-10 hours'
  }, [topClient])

  // Insights and recommendations
  const insights = useMemo(() => [
    `Focus outreach on clients similar to ${topClient?.name || 'top clients'} — they yield highest LTV.`,
    totalRevenue > 30000 ? 
      "If you want to scale to $50k/month, hire one junior editor when revenue > $40k." : 
      "Consider converting high-match one-off clients into retainers.",
    outreachPerDay >= 2 ? 
      "With your current outreach volume, consider hiring a Sales Assistant to manage leads." : 
      "Increase your outreach frequency to at least 3 per day to maximize client acquisition."
  ], [topClient, totalRevenue, outreachPerDay])

  // Calculate KPIs from live client data
  const totalClients = useMemo(() => clients.length, [clients])
  const newClients = useMemo(() => clients.filter(client => {
    const createdDate = new Date(client.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return createdDate > sevenDaysAgo
  }).length, [clients])
  const outreachesDone = useMemo(() => clients.filter(client => client.outreach_date).length, [clients])
  const followUpsPending = useMemo(() => clients.filter(client => 
    client.follow_up_status === 'Not Started' || 
    client.follow_up_status === 'In Progress'
  ).length, [clients])

  // Updated KPI data using live client data
  const kpiData = useMemo(() => [
    { title: 'Total Clients', value: totalClients.toString(), change: `+${newClients} from last week`, icon: <Users className="h-5 w-5" /> },
    { title: 'New Clients', value: newClients.toString(), change: `${newClients} this week`, icon: <UserPlus className="h-5 w-5" /> },
    { title: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+15% from last month', icon: <DollarSign className="h-5 w-5" /> },
    { title: 'Outreaches Done', value: outreachesDone.toString(), change: `+${Math.max(0, 3 - outreachesDone)} remaining today`, icon: <Send className="h-5 w-5" /> },
    { title: 'Follow Ups Pending', value: followUpsPending.toString(), change: '-2 from last week', icon: <Clock className="h-5 w-5" /> },
  ], [totalClients, newClients, totalRevenue, outreachesDone, followUpsPending])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/login')
      } finally {
        // Move setIsMounted to the finally block to avoid setState in effect
        setIsMounted(true)
        setLoading(false)
      }
    }

    const fetchClients = async () => {
      try {
        const clientData = await getClients()
        setClients(clientData || [])
      } catch (error) {
        console.error('Error fetching clients:', error)
        // Check if it's an authentication error
        if (error instanceof Error) {
          if (error.message.includes('Unauthorized') || error.message.includes('401')) {
            console.error('Authentication error - redirecting to login')
            router.push('/login')
          }
        }
        // Set empty array on error to prevent crashes
        setClients([])
      }
    }

    checkAuth()
    fetchClients()
  }, [router])

  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex flex-wrap gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Hero Section - stacked vertically and left-aligned */}
        <div className="flex-shrink-0 flex justify-between items-start">
          <div>
            <TypingAnimation 
              className="text-3xl font-bold"
            >
              GodCRM
            </TypingAnimation>
            <AnimatedShinyText 
              className="block text-base text-muted-foreground mt-1 text-left w-full max-w-none mx-0"
              shimmerWidth={100}
            >
              Your creative agency management solution
            </AnimatedShinyText>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/clients')}
              className="text-base text-violet-400 hover:text-violet-300 focus:outline-none focus:underline focus:underline-offset-2 focus:underline-violet-300 border-b border-violet-400/30 hover:border-violet-400 pb-1 transition-all"
            >
              Manage Clients
            </button>
            <button 
              onClick={() => router.push('/assets')}
              className="text-base text-violet-400 hover:text-violet-300 focus:outline-none focus:underline focus:underline-offset-2 focus:underline-violet-300 border-b border-violet-400/30 hover:border-violet-400 pb-1 transition-all"
            >
              View Assets
            </button>
          </div>
        </div>

        {/* KPI Cards - updated to 5 cards with glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 my-4 flex-shrink-0">
          {kpiData.map((kpi: KpiItem, index: number) => (
            <Card key={index} className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center">
                  <div className="mr-2 text-primary">
                    {kpi.icon}
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{kpi.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-grow min-h-0">
          {/* Left Column - Larger */}
          <div className="lg:col-span-3 space-y-3 flex flex-col">
            {/* Revenue Trend Chart - Now Taller */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg flex-grow flex flex-col">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-lg font-semibold">
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 flex-grow flex flex-col">
                <div className="flex-grow min-h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.2)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#8b5cf6" 
                        tick={{ fill: '#8b5cf6', fontSize: 14 }}
                      />
                      <YAxis 
                        stroke="#8b5cf6" 
                        tick={{ fill: '#8b5cf6', fontSize: 14 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                        domain={[0, 10000]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background)/0.8)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8b5cf6" 
                        fill="url(#colorRevenueViolet)" 
                        fillOpacity={0.3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                      />
                      <defs>
                        <linearGradient id="colorRevenueViolet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Latest Clients - Now Shorter */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg flex-shrink-0">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-lg font-semibold">
                  Latest Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-[160px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {latestClients.map((client) => (
                      <div key={client.id} className="flex items-center p-2 rounded-lg bg-background/20 hover:bg-background/30 transition-all duration-200 border border-white/5">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-base">{client.name}</h4>
                          <p className="text-sm text-muted-foreground">{client.company || 'No company'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{client.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.created_at ? new Date(client.created_at).toLocaleDateString('en-US') : ''}
                          </p>
                        </div>
                        <div className="ml-2 text-muted-foreground">
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                    {latestClients.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No clients found
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Slimmer */}
          <div className="lg:col-span-1 space-y-3 flex flex-col">
            {/* Client Analytics & Allocation Panel */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg flex-grow flex flex-col">
              <CardHeader className="pb-2 pt-3 flex-shrink-0">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Client Analytics & Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 flex-grow flex flex-col">
                {/* Top Summary Row */}
                <div className="mb-4">
                  {/* Top Client */}
                  <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-background/20">
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="font-medium">Top Client:</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{topClient?.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">
                        {topClient ? `$${topClient.revenue.toLocaleString()}` : '$0'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Top 3 Clients */}
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">Top 3 Clients:</div>
                    <div className="space-y-1">
                      {top3Clients.map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between text-sm p-1 rounded">
                          <div className="flex items-center">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                              index === 0 ? 'bg-yellow-500 text-black' : 
                              index === 1 ? 'bg-gray-400 text-black' : 
                              'bg-amber-800 text-white'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="truncate max-w-[80px]">{client.name}</span>
                          </div>
                          <span className="text-muted-foreground">${(client.revenue / 1000).toFixed(1)}k</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Total Revenue */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/20">
                    <span className="font-medium">Total Revenue:</span>
                    <span className="font-bold text-lg text-primary">${(totalRevenue / 1000).toFixed(1)}k</span>
                  </div>
                </div>
                
                {/* Client Revenue List */}
                <div className="flex-grow mb-4">
                  <div className="text-sm font-medium mb-1">All Clients:</div>
                  <div className="h-[120px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                      {clientsWithRevenue.map((client) => (
                        <div 
                          key={client.id} 
                          className="flex items-center justify-between text-sm p-1 rounded cursor-pointer hover:bg-background/30 transition-colors"
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: `hsl(${client.revenue % 360}, 70%, 60%)` }}></div>
                            <span className="truncate max-w-[90px]">{client.name}</span>
                          </div>
                          <span className="text-muted-foreground">${(client.revenue / 1000).toFixed(1)}k</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Suggested Actions & Hiring Allocation */}
                <div className="space-y-3">
                  {/* Suggested Hire */}
                  <div className="p-2 rounded-lg bg-background/20">
                    <div className="text-sm font-medium mb-1">Suggested Hire:</div>
                    <div className="text-primary font-medium">Hire: {suggestedHire}</div>
                  </div>
                  
                  {/* Allocation Split */}
                  <div>
                    <div className="text-sm font-medium mb-1">Recommended Allocation:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="p-1 rounded bg-background/20">
                        <div>Operations</div>
                        <div className="font-medium">{allocation.operations.percentage}% (${(allocation.operations.amount / 1000).toFixed(1)}k)</div>
                      </div>
                      <div className="p-1 rounded bg-background/20">
                        <div>Payroll</div>
                        <div className="font-medium">{allocation.payroll.percentage}% (${(allocation.payroll.amount / 1000).toFixed(1)}k)</div>
                      </div>
                      <div className="p-1 rounded bg-background/20">
                        <div>Growth/Ads</div>
                        <div className="font-medium">{allocation.growth.percentage}% (${(allocation.growth.amount / 1000).toFixed(1)}k)</div>
                      </div>
                      <div className="p-1 rounded bg-background/20">
                        <div>Savings</div>
                        <div className="font-medium">{allocation.savings.percentage}% (${(allocation.savings.amount / 1000).toFixed(1)}k)</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Time Estimate */}
                  <div className="p-2 rounded-lg bg-background/20">
                    <div className="text-sm font-medium mb-1">Time Estimate:</div>
                    <div className="text-muted-foreground">Est. time for top client: {timeEstimate}</div>
                  </div>
                </div>
                
                {/* Insights & Recommendations */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-sm font-medium mb-2">Insights & Recommendations:</div>
                  <div className="space-y-2">
                    {insights.map((insight, index) => (
                      <div key={index} className="text-xs text-muted-foreground p-2 rounded bg-background/10">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ec4899, #8b5cf6);
          border-radius: 10px;
          box-shadow: 0 0 4px rgba(147, 51, 234, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #f97316, #ec4899);
        }
      `}</style>
    </DashboardLayout>
  )
}
