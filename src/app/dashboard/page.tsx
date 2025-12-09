'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnimatedNumber } from '@/components/ui/use-animated-number'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  AreaChart,
  Area,
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
  Target
} from 'lucide-react'
import { Client } from '@/lib/types'
import { getClients } from '@/lib/supabase/db'
import { getClosedClients } from '@/lib/supabase/db'

// Define type for KPI data
interface KpiItem {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  numericValue: number
}

// Define type for client with revenue
interface ClientWithRevenue extends Client {
  revenue: number
}

// Define type for closed client data
interface DashboardClosedClient {
  id: string
  name: string
  revenue: number
  created_at: string
  status: 'closed'
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

// Animated Number Component with premium Apple-style easing
const AnimatedNumber = ({ value, prefix = '', duration = 1200 }: { value: number; prefix?: string; duration?: number }) => {
  const { displayValue, isAnimating } = useAnimatedNumber({
    value,
    duration,
    formatFn: (val) => `${prefix}${Math.round(val).toLocaleString()}`
  });

  return (
    <span 
      className={`transition-all duration-300 ${isAnimating ? 'text-text-secondary' : 'text-text-primary'}`}
      aria-live="polite"
    >
      {displayValue}
    </span>
  );
};

// Animated Currency Component with premium Apple-style easing
const AnimatedCurrency = ({ value, duration = 1200 }: { value: number; duration?: number }) => {
  const { displayValue, isAnimating } = useAnimatedNumber({
    value,
    duration,
    formatFn: (val) => `$${Math.round(val).toLocaleString()}`
  });

  return (
    <span 
      className={`transition-all duration-300 ${isAnimating ? 'text-white/90' : 'text-white'}`}
      aria-live="polite"
    >
      {displayValue}
    </span>
  );
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [closedClients, setClosedClients] = useState<DashboardClosedClient[]>([])
  const router = useRouter()
  
  // Get latest 3 clients for the dashboard
  const latestClients = clients.slice(0, 3)

  // Calculate revenue data from closed clients instead of random data
  const clientsWithRevenue = useMemo(() => {
    // If we have closed client data, use it
    if (closedClients.length > 0) {
      // Map closed clients to the format needed for dashboard
      const closedClientData: ClientWithRevenue[] = closedClients.map(client => ({
        id: client.id,
        name: client.name,
        revenue: client.revenue,
        created_at: client.created_at,
        status: 'closed'
      } as ClientWithRevenue));
      
      // Combine with regular clients (for non-revenue data)
      const combinedClients: ClientWithRevenue[] = [...clients.map(c => ({...c, revenue: 0})), ...closedClientData];
      
      // Sort by revenue
      return combinedClients.sort((a, b) => b.revenue - a.revenue);
    }
    
    // If no closed clients, create mock data based on regular clients for demonstration
    if (clients.length > 0) {
      return clients.map(client => ({
        ...client,
        revenue: Math.floor(Math.random() * 5000) + 1000 // Random revenue between $1,000 and $6,000 for demo
      })).sort((a, b) => b.revenue - a.revenue);
    }
    
    // Return empty array if no clients
    return [];
  }, [clients, closedClients]);

  // Calculate total revenue from closed clients
  const totalRevenue = useMemo(() => closedClients.reduce((sum, client) => sum + client.revenue, 0), [closedClients])

  // Get top client
  const topClient = useMemo(() => clientsWithRevenue[0], [clientsWithRevenue])

  // Get top 3 clients
  const top3Clients = useMemo(() => clientsWithRevenue.slice(0, 3), [clientsWithRevenue])

  // Calculate outreach frequency (mock data)
  const outreachCount = useMemo(() => clients.filter(client => client.outreach_date).length, [clients])
  const outreachPerDay = useMemo(() => outreachCount > 0 ? outreachCount / 7 : 0, [outreachCount]) // Assuming 7 days

  // Suggested hire logic - with fallback for when there's no revenue data
  const suggestedHire = useMemo(() => {
    // If we have no closed client data, fall back to using regular client count
    const clientCount = clients.length;
    
    if (totalRevenue > 50000 && outreachPerDay >= 3) {
      return 'Sales Assistant'
    } else if (totalRevenue > 30000 && outreachPerDay >= 2) {
      return 'Project Manager'
    } else if (totalRevenue > 15000) {
      return 'Junior Editor'
    } else if (clientCount > 20) {
      // Fallback logic based on client count
      return 'Junior Editor'
    } else if (clientCount > 10) {
      return 'Editor'
    }
    return 'Freelancer'
  }, [totalRevenue, outreachPerDay, clients.length])

  // Allocation split - with fallback for when there's no revenue
  const allocation = useMemo(() => {
    // If no revenue, use a default allocation based on client count
    if (totalRevenue <= 0) {
      const clientCount = clients.length;
      if (clientCount > 0) {
        // Create mock revenue based on client count for demonstration
        const mockRevenue = clientCount * 1000;
        return {
          operations: { percentage: 40, amount: mockRevenue * 0.4 },
          payroll: { percentage: 30, amount: mockRevenue * 0.3 },
          growth: { percentage: 20, amount: mockRevenue * 0.2 },
          savings: { percentage: 10, amount: mockRevenue * 0.1 }
        };
      }
      
      // Default values when no data
      return {
        operations: { percentage: 40, amount: 0 },
        payroll: { percentage: 30, amount: 0 },
        growth: { percentage: 20, amount: 0 },
        savings: { percentage: 10, amount: 0 }
      };
    }
    
    // Use real revenue data when available
    return {
      operations: { percentage: 40, amount: totalRevenue * 0.4 },
      payroll: { percentage: 30, amount: totalRevenue * 0.3 },
      growth: { percentage: 20, amount: totalRevenue * 0.2 },
      savings: { percentage: 10, amount: totalRevenue * 0.1 }
    };
  }, [totalRevenue, clients.length])

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
  const totalClients = useMemo(() => closedClients.length, [closedClients])
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
    { title: 'Total Clients', value: totalClients.toString(), change: `+${newClients} from last week`, icon: <Users className="h-5 w-5" />, numericValue: totalClients },
    { title: 'New Leads', value: newClients.toString(), change: `${newClients} this week`, icon: <UserPlus className="h-5 w-5" />, numericValue: newClients },
    { title: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+15% from last month', icon: <DollarSign className="h-5 w-5" />, numericValue: totalRevenue },
    { title: 'Outreaches Done', value: outreachesDone.toString(), change: `+${Math.max(0, 3 - outreachesDone)} remaining today`, icon: <Send className="h-5 w-5" />, numericValue: outreachesDone },
    { title: 'Follow Ups Pending', value: followUpsPending.toString(), change: '-2 from last week', icon: <Clock className="h-5 w-5" />, numericValue: followUpsPending },
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

    const fetchClosedClientsData = async () => {
      try {
        const closedClientData = await getClosedClients()
        // Transform the data to match DashboardClosedClient interface
        const transformedData: DashboardClosedClient[] = closedClientData.map(client => ({
          id: client.id,
          name: client.name,
          revenue: client.monthlyRevenue,
          created_at: client.created_at,
          status: 'closed'
        }))
        setClosedClients(transformedData || [])
      } catch (error) {
        console.error('Error fetching closed clients:', error)
        setClosedClients([])
      }
    }

    checkAuth()
    fetchClients()
    fetchClosedClientsData()
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
      {/* Background video for Apple-style grainy effect */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,29,33,0.8)_0%,rgba(10,10,12,0.95)_100%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im5vaXNlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjEwIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZlVHVyYnVsZW5jZT48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ij48L3JlY3Q+PC9zdmc+')] opacity-10"></div>
      </div>
      
      <div className="flex flex-col min-h-screen relative z-10 animate-fadeInUp">
        {/* Hero Section - stacked vertically and left-aligned */}
        <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-4 py-4 px-2">
          <div className="mb-4 md:mb-0">
            <TypingAnimation 
              className="text-5xl font-bold bg-gradient-to-r from-gold-accent to-gold-dim bg-clip-text text-transparent"
            >
              GodCRM
            </TypingAnimation>
            <AnimatedShinyText 
              className="block text-xl text-text-secondary mt-2 text-left w-full max-w-none mx-0"
              shimmerWidth={100}
            >
              Your creative agency management solution
            </AnimatedShinyText>
          </div>
          <div className="flex gap-6">
            <button 
              onClick={() => router.push('/clients')}
              className="text-lg text-text-secondary hover:text-gold-accent focus:outline-none border-b border-soft hover:border-gold-accent pb-1 transition-all cursor-pointer"
            >
              Manage Clients
            </button>
          </div>
        </div>

        {/* KPI Cards - updated to 5 cards with enhanced glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 my-4 flex-shrink-0 animate-fadeInUp">
          {kpiData.map((kpi: KpiItem, index: number) => (
            <Card 
              key={index} 
              className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-stone-lg hover:border-gold-accent/30"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center">
                  <div className="mr-3 text-gold-accent p-2.5 bg-stone-black-2 rounded-xl">
                    {kpi.icon}
                  </div>
                  <CardTitle className="text-base font-medium text-text-secondary">
                    {kpi.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-4xl font-bold mb-2 text-text-primary">
                  {kpi.title === 'Revenue' ? (
                    <AnimatedCurrency value={kpi.numericValue} duration={1200} />
                  ) : (
                    <AnimatedNumber value={kpi.numericValue} duration={1200} />
                  )}
                </div>
                <p className="text-sm text-text-muted">{kpi.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 flex-grow min-h-0 mb-6">
          {/* Left Column - Larger */}
          <div className="lg:col-span-3 space-y-5 flex flex-col">
            {/* Revenue Trend Chart - Now shorter */}
            <Card className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone flex flex-col transition-all duration-300 hover:shadow-stone-lg animate-fadeInUp">
              <CardHeader className="pb-4 pt-5">
                <CardTitle className="text-2xl font-semibold text-text-primary">
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex-grow flex flex-col">
                <div style={{ height: '450px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 128, 75, 0.3)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#C9C9C9" 
                        tick={{ fill: '#C9C9C9', fontSize: 14 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#C9C9C9" 
                        tick={{ fill: '#C9C9C9', fontSize: 14 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                        domain={[0, 10000]}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(29, 29, 33, 0.9)', 
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(47, 47, 47, 0.5)',
                          borderRadius: '12px',
                          color: '#F2F2F2',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.45)'
                        }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                        itemStyle={{ color: '#F2F2F2' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#C8A25F" 
                        fill="url(#colorRevenueGold)" 
                        fillOpacity={0.2}
                        strokeWidth={3}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#C8A25F" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#C8A25F', stroke: 'rgba(0,0,0,0.2)', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#C8A25F', stroke: 'rgba(0,0,0,0.2)', strokeWidth: 2 }}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />
                      <defs>
                        <linearGradient id="colorRevenueGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C8A25F" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#C8A25F" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Latest Clients - Now Shorter */}
            <Card className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone flex-shrink-0 transition-all duration-300 hover:shadow-stone-lg animate-fadeInUp">
              <CardHeader className="pb-4 pt-5">
                <CardTitle className="text-2xl font-semibold text-text-primary">
                  Latest Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="h-[180px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-3">
                    {latestClients.map((client) => (
                      <div key={client.id} className="flex items-center p-3 rounded-[18px] bg-stone-black-2 hover:bg-hover-surface transition-all duration-300 border border-soft hover:border-gold-accent/20">
                        <div className="flex-shrink-0 w-10 h-10 rounded-[12px] bg-input-bg flex items-center justify-center mr-3">
                          <TrendingUp className="h-5 w-5 text-text-primary" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-text-primary">{client.name}</h4>
                          <p className="text-sm text-text-muted">{client.company || 'No company'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-primary">{client.email}</p>
                          <p className="text-sm text-text-muted">
                            {client.created_at ? new Date(client.created_at).toLocaleDateString('en-US') : ''}
                          </p>
                        </div>
                        <div className="ml-3 text-text-secondary">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                    {latestClients.length === 0 && (
                      <div className="text-center py-6 text-text-muted">
                        No clients found
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Slimmer */}
          <div className="lg:col-span-1 space-y-5 flex flex-col">
            {/* Client Analytics & Allocation Panel */}
            <Card className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone flex-grow flex flex-col transition-all duration-300 hover:shadow-stone-lg animate-fadeInUp">
              <CardHeader className="pb-4 pt-5 flex-shrink-0">
                <CardTitle className="text-2xl font-semibold flex items-center text-text-primary">
                  <Target className="mr-2 h-6 w-6" />
                  Client Analytics & Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex-grow flex flex-col">
                {/* Top Summary Row */}
                <div className="mb-5">
                  {/* Top Client */}
                  <div className="flex items-center justify-between mb-4 p-3 rounded-[18px] bg-stone-black-2 border border-soft">
                    <div className="flex items-center">
                      <Trophy className="h-6 w-6 text-yellow-400 mr-3" />
                      <span className="font-medium text-text-primary">Top Client:</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-text-primary">{topClient?.name || 'N/A'}</div>
                      <div className="text-sm text-text-muted">
                        {topClient ? `$${topClient.revenue.toLocaleString()}` : '$0'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Top 3 Clients */}
                  <div className="mb-4">
                    <div className="text-base font-medium mb-2 text-text-primary">Top 3 Clients:</div>
                    <div className="space-y-2">
                      {top3Clients.map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between text-sm p-2 rounded-xl">
                          <div className="flex items-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                              index === 0 ? 'bg-yellow-400 text-black' : 
                              index === 1 ? 'bg-gray-300 text-black' : 
                              'bg-amber-700 text-text-primary'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="truncate max-w-[90px] font-medium text-text-primary">{client.name}</span>
                          </div>
                          <span className="text-text-muted">${(client.revenue / 1000).toFixed(1)}k</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Total Revenue */}
                  <div className="flex items-center justify-between p-3 rounded-[18px] bg-stone-black-2 border border-soft">
                    <span className="font-medium text-text-primary">Total Revenue:</span>
                    <span className="font-bold text-xl text-gold-accent">$<AnimatedNumber value={totalRevenue / 1000} prefix="" duration={1200} />k</span>
                  </div>
                </div>
                
                {/* Client Revenue List */}
                <div className="flex-grow mb-5">
                  <div className="text-base font-medium mb-2 text-text-primary">All Clients:</div>
                  <div className="h-[140px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      {clientsWithRevenue.map((client) => (
                        <div 
                          key={client.id} 
                          className="flex items-center justify-between text-sm p-2 rounded-xl cursor-pointer hover:bg-hover-surface transition-colors border border-soft"
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: `hsl(${client.revenue % 360}, 70%, 60%)` }}></div>
                            <span className="truncate max-w-[100px] text-text-primary">{client.name}</span>
                          </div>
                          <span className="text-text-muted">${(client.revenue / 1000).toFixed(1)}k</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Suggested Actions & Hiring Allocation */}
                <div className="space-y-4">
                  {/* Suggested Hire */}
                  <div className="p-3 rounded-[18px] bg-stone-black-2 border border-soft">
                    <div className="text-base font-medium mb-1 text-text-primary">Suggested Hire:</div>
                    <div className="text-gold-accent font-semibold">Hire: {suggestedHire}</div>
                  </div>
                  
                  {/* Allocation Split */}
                  <div>
                    <div className="text-base font-medium mb-2 text-text-primary">Recommended Allocation:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-stone-black-2 border border-soft">
                        <div>Operations</div>
                        <div className="font-semibold text-gold-accent">{allocation.operations.percentage}% ($<AnimatedNumber value={allocation.operations.amount / 1000} prefix="" duration={1200} />k)</div>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-black-2 border border-soft">
                        <div>Payroll</div>
                        <div className="font-semibold text-gold-accent">{allocation.payroll.percentage}% ($<AnimatedNumber value={allocation.payroll.amount / 1000} prefix="" duration={1200} />k)</div>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-black-2 border border-soft">
                        <div>Growth/Ads</div>
                        <div className="font-semibold text-gold-accent">{allocation.growth.percentage}% ($<AnimatedNumber value={allocation.growth.amount / 1000} prefix="" duration={1200} />k)</div>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-black-2 border border-soft">
                        <div>Savings</div>
                        <div className="font-semibold text-gold-accent">{allocation.savings.percentage}% ($<AnimatedNumber value={allocation.savings.amount / 1000} prefix="" duration={1200} />k)</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Time Estimate */}
                  <div className="p-3 rounded-[18px] bg-stone-black-2 border border-soft">
                    <div className="text-base font-medium mb-1 text-text-primary">Time Estimate:</div>
                    <div className="text-text-muted">Est. time for top client: {timeEstimate}</div>
                  </div>
                </div>
                
                {/* Insights & Recommendations */}
                <div className="mt-4 pt-4 border-t border-soft">
                  <div className="text-base font-medium mb-2 text-text-primary">Insights & Recommendations:</div>
                  <div className="space-y-2">
                    {insights.map((insight, index) => (
                      <div key={index} className="text-sm text-text-muted p-3 rounded-xl bg-stone-black-2 border border-soft">
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
          background: rgba(42, 42, 46, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #C8A25F, #9A804B);
          border-radius: 10px;
          box-shadow: 0 0 4px rgba(200, 162, 95, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9A804B, #C8A25F);
          box-shadow: 0 0 8px rgba(200, 162, 95, 0.5);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </DashboardLayout>
  )
}