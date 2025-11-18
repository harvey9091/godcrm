'use client'

import { useEffect, useState } from 'react'
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
  TrendingUp
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

const revenueData = [
  { name: 'Retainers', value: 45000, color: '#ec4899' },
  { name: 'One-off Projects', value: 32000, color: '#f97316' },
  { name: 'Ad Spend Management', value: 18000, color: '#8b5cf6' },
  { name: 'Consulting', value: 12000, color: '#0ea5e9' },
  { name: 'Other', value: 5000, color: '#10b981' },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const router = useRouter()

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
        setClients(clientData)
      } catch (error) {
        console.error('Error fetching clients:', error)
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

  // Get latest 3 clients for the dashboard
  const latestClients = clients.slice(0, 3)

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Hero Section - stacked vertically and left-aligned */}
        <div className="flex-shrink-0">
          <TypingAnimation 
            className="text-3xl font-bold"
          >
            GodCRM
          </TypingAnimation>
          <AnimatedShinyText className="text-sm text-muted-foreground mt-1">
            Your creative agency management solution
          </AnimatedShinyText>
        </div>

        {/* KPI Cards - updated to 5 cards with glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 my-4 flex-shrink-0">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center">
                  <div className="mr-2 text-primary">
                    {kpi.icon}
                  </div>
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-grow min-h-0">
          {/* Left Column - Larger */}
          <div className="lg:col-span-2 space-y-3 flex flex-col">
            {/* Agency Revenue Trend Chart */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg flex-shrink-0">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-base font-semibold">
                  Agency Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.2)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#ec4899" 
                        tick={{ fill: '#ec4899', fontSize: 10 }}
                      />
                      <YAxis 
                        stroke="#ec4899" 
                        tick={{ fill: '#ec4899', fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background)/0.8)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          color: 'hsl(var(--foreground))'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#ec4899" 
                        fill="url(#colorRevenue)" 
                        fillOpacity={0.3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#ec4899" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }}
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Latest Projects List */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg flex-grow flex flex-col">
              <CardHeader className="pb-2 pt-3 flex-shrink-0">
                <CardTitle className="text-base font-semibold">
                  Latest Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 flex-grow flex flex-col">
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {latestClients.map((client) => (
                      <div key={client.id} className="flex items-center p-2 rounded-lg bg-background/20 hover:bg-background/30 transition-all duration-200 border border-white/5">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-xs">{client.name}</h4>
                          <p className="text-xs text-muted-foreground">{client.company || 'No company'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs">{client.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {client.created_at ? new Date(client.created_at).toLocaleDateString() : ''}
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

          {/* Right Column - Narrower */}
          <div className="lg:col-span-1 space-y-3 flex flex-col">
            {/* Revenue Breakdown Donut Chart */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg flex-grow flex flex-col">
              <CardHeader className="pb-2 pt-3 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-semibold">
                    Revenue Breakdown
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Select>
                      <SelectTrigger className="w-[80px] h-7 text-xs">
                        <SelectValue placeholder="30d" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7d</SelectItem>
                        <SelectItem value="30">30d</SelectItem>
                        <SelectItem value="90">90d</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                      Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-grow flex flex-col justify-center">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        >
                          {revenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background)/0.8)', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                            color: 'hsl(var(--foreground))'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-xl font-bold text-primary drop-shadow-[0_0_4px_rgba(147,51,234,0.5)]">72%</div>
                      <span className="text-xs text-muted-foreground text-center mt-0.5">+12%</span>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 w-full">
                    {revenueData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-1.5" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs flex-grow truncate">{item.name}</span>
                        <span className="text-xs font-medium">${(item.value/1000).toFixed(0)}k</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 flex-shrink-0">
          <RainbowButton onClick={() => router.push('/clients')} className="h-9 px-3 text-sm">
            Manage Clients
          </RainbowButton>
          <RainbowButton onClick={() => router.push('/assets')} className="h-9 px-3 text-sm">
            View Assets
          </RainbowButton>
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

// Updated KPI data with all requested metrics
const kpiData = [
  { title: 'Total Clients', value: '24', change: '+2 from last month', icon: <Users className="h-5 w-5" /> },
  { title: 'New Clients', value: '4', change: '+1 from last month', icon: <UserPlus className="h-5 w-5" /> },
  { title: 'Revenue', value: '$12,400', change: '+15% from last month', icon: <DollarSign className="h-5 w-5" /> },
  { title: 'Outreaches Done', value: '18', change: '+3 from last week', icon: <Send className="h-5 w-5" /> },
  { title: 'Follow Ups Pending', value: '7', change: '-2 from last week', icon: <Clock className="h-5 w-5" /> },
]