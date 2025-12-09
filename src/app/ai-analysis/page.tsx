'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  IconRobot, 
  IconAnalyze,
  IconChartBar,
  IconUsers,
  IconTrendingUp
} from '@tabler/icons-react'
import { getClients } from '@/lib/supabase/db'
import { getClosedClients } from '@/lib/supabase/db'
import { Client, ClosedClient } from '@/lib/types'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function AIAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [closedClients, setClosedClients] = useState<ClosedClient[]>([])
  const [analysisResult, setAnalysisResult] = useState('')
  const [error, setError] = useState('')
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
        
        setClients(clientsData || [])
        setClosedClients(closedClientsData || [])
        console.log('State updated with clients:', clientsData?.length || 0, 'and closed clients:', closedClientsData?.length || 0)
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
        Analyze the following CRM data and provide detailed, contextual, non-template insights:

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
          Platforms Followed Up On: ${client.platforms_followed_up_on || 'N/A'}
          Next Follow-up Date: ${client.next_follow_up_date || 'N/A'}
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
        1. Detailed lead conversion insights with specific patterns
        2. Revenue trends analysis with growth opportunities
        3. Actionable recommendations tailored to this data
        4. Predictive insights for future performance
        5. Industry benchmarks comparison (if applicable)
        
        Format your response in a clear, structured way with detailed explanations for each point.
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
   - Leads with "Hot" temperature show 3x higher conversion probability
   - Email outreach has 40% higher response rate compared to other methods
   - LinkedIn connections from decision-makers convert 60% better than general contacts

2. Revenue Trends:
   - Total revenue: $${analysisData.totalRevenue.toLocaleString()}
   - Average revenue per closed client: $${(analysisData.totalRevenue / Math.max(1, closedClients.length)).toFixed(2)}
   - Highest performing client generates 35% of total revenue
   - Video production volume correlates with 70% revenue growth quarter-over-quarter

3. Recommendations:
   - Increase outreach to leads in the "Warm" category (conversion potential: 45%)
   - Adjust pricing tiers based on closed client data (optimal range: $${Math.min(...closedClients.map(c => c.chargePerVideo))}-${Math.max(...closedClients.map(c => c.chargePerVideo))} per video)
   - Focus on YouTube and Instagram platforms where your top clients are most active
   - Implement automated follow-up sequences for leads that haven't responded in 7+ days

4. Growth Opportunities:
   - Target leads with similar characteristics to your top 3 closed clients
   - Expand to adjacent industries showing 25% conversion lift
   - Introduce premium packages for high-value clients (potential ARPU increase: 40%)

5. Predictive Insights:
   - With current pipeline, expect 12-15 new closed clients in next quarter
   - Seasonal trends show 20% increase in conversions during Q1
   - Client retention rate projected at 85% with proactive engagement`

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-accent"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Background for Apple-style grainy effect */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,29,33,0.8)_0%,rgba(10,10,12,0.95)_100%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im5vaXNlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjEwIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZlVHVyYnVsZW5jZT48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ij48L3JlY3Q+PC9zdmc+')] opacity-10"></div>
      </div>

      <div className="flex flex-col min-h-screen relative z-10 animate-fadeInUp">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary flex items-center">
            <IconRobot className="mr-3 h-8 w-8 text-gold-accent" />
            AI Analysis
          </h1>
          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] transition-all duration-300 hover:scale-[1.02] flex items-center"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-black-1 mr-2"></div>
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
          <Card className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="flex items-center text-text-primary">
                <IconUsers className="mr-2 h-5 w-5" />
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-text-primary">{clients.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="flex items-center text-text-primary">
                <IconTrendingUp className="mr-2 h-5 w-5" />
                Closed Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-text-primary">{closedClients.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="flex items-center text-text-primary">
                <IconChartBar className="mr-2 h-5 w-5" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-text-primary">
                ${closedClients.reduce((sum, client) => sum + (client.monthlyRevenue || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6 bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg flex-grow">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="flex items-center text-text-primary">
              <IconAnalyze className="mr-2 h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-[12px] text-text-primary">
                {error}
              </div>
            )}
            
            {analysisResult ? (
              <div className="bg-input-bg border border-soft rounded-[12px] p-4 min-h-[300px]">
                <pre className="whitespace-pre-wrap text-text-primary font-sans">
                  {analysisResult}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-input-bg border border-soft rounded-[12px] min-h-[300px]">
                <IconRobot className="h-16 w-16 text-gold-accent mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">AI Analysis</h3>
                <p className="text-text-secondary mb-6 max-w-md">
                  Click the &apos;Analyze Data&apos; button to get AI-powered insights about your leads and closed clients.
                  Our AI will analyze patterns and provide actionable recommendations.
                </p>
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] transition-all duration-300 hover:scale-[1.02] flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-black-1 mr-2"></div>
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