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
  { name: 'Retainers', value: 45000, color: 'hsl(var(--chart-1))' },
  { name: 'One-off Projects', value: 32000, color: 'hsl(var(--chart-2))' },
  { name: 'Ad Spend Management', value: 18000, color: 'hsl(var(--chart-3))' },
  { name: 'Consulting', value: 12000, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 5000, color: 'hsl(var(--chart-5))' },
]

const projectData = [
  { id: 1, title: 'Brand Identity Redesign', client: 'Acme Corp', dueDate: '2025-11-25', email: 'contact@acme.com' },
  { id: 2, title: 'Social Media Campaign', client: 'Global Tech', dueDate: '2025-11-30', email: 'info@globaltech.com' },
  { id: 3, title: 'Product Video Series', client: 'Innovate Inc', dueDate: '2025-12-05', email: 'hello@innovate.com' },
  { id: 4, title: 'Website Redesign', client: 'Future Solutions', dueDate: '2025-12-10', email: 'support@futuresol.com' },
]

// Updated KPI data with all requested metrics
const kpiData = [
  { title: 'Total Clients', value: '24', change: '+2 from last month', icon: <Users className="h-5 w-5" /> },
  { title: 'New Clients', value: '4', change: '+1 from last month', icon: <UserPlus className="h-5 w-5" /> },
  { title: 'Revenue', value: '$12,400', change: '+15% from last month', icon: <DollarSign className="h-5 w-5" /> },
  { title: 'Outreaches Done', value: '18', change: '+3 from last week', icon: <Send className="h-5 w-5" /> },
  { title: 'Follow Ups Pending', value: '7', change: '-2 from last week', icon: <Clock className="h-5 w-5" /> },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
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

    checkAuth()
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
      <div className="space-y-8">
        {/* Hero Section - stacked vertically and left-aligned */}
        <div className="space-y-4">
          <TypingAnimation 
            className="text-4xl font-bold"
          >
            GodCRM
          </TypingAnimation>
          <AnimatedShinyText className="text-xl">
            Your creative agency management solution
          </AnimatedShinyText>
        </div>

        {/* KPI Cards - updated to 5 cards with glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral-500 to-pink-500"></div>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="mr-2 text-primary">
                    {kpi.icon}
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Larger */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agency Revenue Trend Chart */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Agency Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[520px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.2)" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background)/0.8)', 
                          backdropFilter: 'blur(10px)',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#colorRevenue)" 
                        fillOpacity={0.3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Latest Projects List */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Latest Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectData.map((project) => (
                    <div key={project.id} className="flex items-center p-4 rounded-xl bg-background/20 hover:bg-background/30 transition-all duration-200 border border-white/5">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{project.title}</h4>
                        <p className="text-sm text-muted-foreground">{project.client}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{project.dueDate}</p>
                        <p className="text-xs text-muted-foreground">{project.email}</p>
                      </div>
                      <div className="ml-4 text-muted-foreground">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Narrower */}
          <div className="lg:col-span-1">
            {/* Revenue Breakdown Donut Chart */}
            <Card className="bg-card/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    Revenue Breakdown
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Select>
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue placeholder="Last 30 days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      See Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
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
                            borderRadius: 'var(--radius)'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">72%</span>
                      <span className="text-xs text-muted-foreground text-center">Improved from last month</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 w-full">
                    {revenueData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm flex-grow">{item.name}</span>
                        <span className="text-sm font-medium">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <RainbowButton onClick={() => router.push('/clients')}>
            Manage Clients
          </RainbowButton>
          <RainbowButton onClick={() => router.push('/assets')}>
            View Assets
          </RainbowButton>
        </div>
      </div>
    </DashboardLayout>
  )
}