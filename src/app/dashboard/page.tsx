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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock data for the chart
const chartData = [
  { name: 'Jan', clients: 4, revenue: 2400 },
  { name: 'Feb', clients: 3, revenue: 1398 },
  { name: 'Mar', clients: 2, revenue: 9800 },
  { name: 'Apr', clients: 5, revenue: 3908 },
  { name: 'May', clients: 6, revenue: 4800 },
  { name: 'Jun', clients: 3, revenue: 3800 },
]

// Updated KPI data with all requested metrics
const kpiData = [
  { title: 'Total Clients', value: '24', change: '+2 from last month' },
  { title: 'New Clients', value: '4', change: '+1 from last month' },
  { title: 'Revenue', value: '$12,400', change: '+15% from last month' },
  { title: 'Outreaches Done', value: '18', change: '+3 from last week' },
  { title: 'Follow Ups Pending', value: '7', change: '-2 from last week' },
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

        {/* KPI Cards - updated to 5 cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{kpi.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className="text-sm text-muted-foreground">{kpi.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Section - increased height */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <AnimatedGradientText className="text-xl font-bold">
                  Monthly Statistics
                </AnimatedGradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96"> {/* Increased height from h-80 to h-96 */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clients" fill="#8884d8" name="New Clients" />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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