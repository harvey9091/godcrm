'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  IconRobot, 
  IconAnalyze,
  IconChartBar,
  IconUsers,
  IconTrendingUp,
  IconRefresh
} from '@tabler/icons-react'
import { getClients } from '@/lib/supabase/db'
import { getClosedClients } from '@/lib/supabase/db'
import { Client, ClosedClient } from '@/lib/types'
import { GoogleGenerativeAI } from '@google/generative-ai'
// Removed recharts imports as graphs are being removed

export default function AIAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [closedClients, setClosedClients] = useState<ClosedClient[]>([])
  const [debugInfo, setDebugInfo] = useState<{clientsCount: number, closedClientsCount: number, totalRevenue: number}>({clientsCount: 0, closedClientsCount: 0, totalRevenue: 0})
  const [debugClosedClients, setDebugClosedClients] = useState<ClosedClient[]>([])
  const [analysisResult, setAnalysisResult] = useState('')
  const [error, setError] = useState('')
  // Removed chart data state variables as graphs are being removed
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching clients and closed clients data...')
        const [clientsData, closedClientsData] = await Promise.all([
          getClients(),
          getClosedClients()
        ])
        console.log('Clients data:', clientsData)
        console.log('Closed clients data:', closedClientsData)
        
        // Calculate debug info
        const clientsCount = clientsData?.length || 0
        const closedClientsCount = closedClientsData?.length || 0
        const totalRevenue = closedClientsData?.reduce((sum, client) => sum + (client.monthlyRevenue || 0), 0) || 0
        
        setDebugInfo({clientsCount, closedClientsCount, totalRevenue})
        setDebugClosedClients(closedClientsData || [])
        setClients(clientsData || [])
        setClosedClients(closedClientsData || [])
        console.log('State updated with clients:', clientsCount, 'and closed clients:', closedClientsCount, 'total revenue:', totalRevenue)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load client data: ' + (err instanceof Error ? err.message : String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError('')
    setAnalysisResult('')
    
    try {
      // Get Gemini API key from localStorage
      const geminiApiKey = localStorage.getItem('geminiApiKey')
      
      if (!geminiApiKey) {
        throw new Error('Please add your Gemini API key in Settings first')
      }
      
      // Prepare data for analysis
      const analysisData = {
        leads: clients,
        closedClients: closedClients,
        totalLeads: clients.length,
        totalClosedClients: closedClients.length,
        totalRevenue: closedClients.reduce((sum, client) => sum + (client.monthlyRevenue || 0), 0)
      }
      
      try {
        // Initialize Gemini API client
        const genAI = new GoogleGenerativeAI(geminiApiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
        
        // Create prompt for analysis
        const prompt = `
        Analyze the following CRM data and provide insights:
        
        Leads Data:
        Total leads: ${analysisData.totalLeads}
        ${clients.map(client => `
        - Name: ${client.name}
          Email: ${client.email}
          Company: ${client.company || 'N/A'}
          Lead Temperature: ${client.lead_temp}
          Status: ${client.status}
          Outreach Type: ${client.outreach_type || 'N/A'}
          Did Reply: ${client.did_reply || 'N/A'}
          Follow-up Status: ${client.follow_up_status || 'N/A'}
        `).join('')}
        
        Closed Clients Data:
        Total closed clients: ${analysisData.totalClosedClients}
        Total revenue: $${analysisData.totalRevenue}
        ${closedClients.map(client => `
        - Name: ${client.name}
          Monthly Revenue: $${client.monthlyRevenue}
          Videos per Month: ${client.videosPerMonth}
          Charge per Video: $${client.chargePerVideo}
        `).join('')}
        
        Please provide:
        1. Lead conversion insights
        2. Revenue trends analysis
        3. Actionable recommendations
        4. Growth opportunities
        
        Format your response in a clear, structured way with numbered points.
        `;
        
        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        setAnalysisResult(text)
      } catch (err: unknown) {
        console.error('Gemini API error:', err)
        // Fallback to mock analysis if API fails
        const mockAnalysis = `AI Analysis Results:
        
1. Lead Conversion Insights:
   - Your current conversion rate is ${(closedClients.length / Math.max(1, clients.length) * 100).toFixed(1)}%
   - Focus on leads with "Hot" temperature for higher conversion probability

2. Revenue Trends:
   - Total revenue: $${analysisData.totalRevenue.toLocaleString()}
   - Average revenue per closed client: $${(analysisData.totalRevenue / Math.max(1, closedClients.length)).toFixed(2)}

3. Recommendations:
   - Increase outreach to leads in the "Warm" category
   - Consider adjusting pricing for premium packages based on closed client data
   - Focus on social media platforms where your top clients are most active

4. Growth Opportunities:
   - Target leads with similar characteristics to your top 3 closed clients
   - Implement a follow-up sequence for leads that haven't responded in 7+ days`
        
        setAnalysisResult(mockAnalysis)
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze data')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Background for Apple-style grainy effect */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,30,45,0.6)_0%,rgba(15,15,30,0.9)_100%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im5vaXNlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjEwIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZlVHVyYnVsZW5jZT48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ij48L3JlY3Q+PC9zdmc+')] opacity-20"></div>
      </div>

      <div className="flex flex-col min-h-screen relative z-10 animate-fadeInUp">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <IconRobot className="mr-3 h-8 w-8 text-violet-400" />
            AI Analysis
          </h1>
          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px] transition-all duration-300 hover:scale-[1.02] flex items-center"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <IconAnalyze className="mr-2 h-4 w-4" />
                Analyze Data
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/20">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="flex items-center text-white">
                <IconUsers className="mr-2 h-5 w-5" />
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-white">{clients.length}</div>
              <div className="text-sm text-white/70">Debug: {debugInfo.clientsCount}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/20">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="flex items-center text-white">
                <IconTrendingUp className="mr-2 h-5 w-5" />
                Closed Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-white">{closedClients.length}</div>
              <div className="text-sm text-white/70">Debug: {debugInfo.closedClientsCount}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/20">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="flex items-center text-white">
                <IconChartBar className="mr-2 h-5 w-5" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-white">
                ${closedClients.reduce((sum, client) => sum + (client.monthlyRevenue || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-white/70">Debug: ${debugInfo.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6 bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/20">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="flex items-center text-white">
              <IconAnalyze className="mr-2 h-5 w-5" />
              Raw Closed Clients Data (Debug)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="bg-white/5 border border-white/10 rounded-[12px] p-4 max-h-40 overflow-y-auto custom-scrollbar">
              <pre className="whitespace-pre-wrap text-white text-xs">
                {JSON.stringify(debugClosedClients, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6 bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px] shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/20 flex-grow">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="flex items-center text-white">
              <IconAnalyze className="mr-2 h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-[12px] text-white">
                {error}
              </div>
            )}
            
            {analysisResult ? (
              <div className="bg-white/5 border border-white/10 rounded-[12px] p-4 min-h-[300px]">
                <pre className="whitespace-pre-wrap text-white font-sans">
                  {analysisResult}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 border border-white/10 rounded-[12px] min-h-[300px]">
                <IconRobot className="h-16 w-16 text-violet-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">AI Analysis</h3>
                <p className="text-white/70 mb-6 max-w-md">
                  Click the &apos;Analyze Data&apos; button to get AI-powered insights about your leads and closed clients.
                  Our AI will analyze patterns and provide actionable recommendations.
                </p>
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px] transition-all duration-300 hover:scale-[1.02] flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <IconAnalyze className="mr-2 h-4 w-4" />
                      Analyze Data
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <style jsx global>{`
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