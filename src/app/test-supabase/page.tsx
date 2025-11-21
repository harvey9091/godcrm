'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { debugDatabaseTables } from '@/lib/supabase/table-debug'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconDatabase, IconRefresh, IconAlertCircle } from '@tabler/icons-react'

export default function DebugTablesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [debugOutput, setDebugOutput] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Authentication error:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const runDebug = async () => {
    try {
      setError(null)
      setDebugOutput(['Running database debug...'])
      
      // Capture console.log output
      const originalLog = console.log
      const logs: string[] = []
      
      console.log = (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        logs.push(message)
        setDebugOutput(prev => [...prev, message])
      }
      
      await debugDatabaseTables()
      
      // Restore original console.log
      console.log = originalLog
      
      setDebugOutput(prev => [...prev, 'Debug completed successfully'])
    } catch (err) {
      console.error('Debug error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Supabase Debug</h1>
            <p className="text-white/70 mt-1">Debug database tables and connections</p>
          </div>
          <Button 
            onClick={runDebug}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-[12px] flex items-center"
          >
            <IconRefresh className="mr-2 h-4 w-4" />
            Run Debug
          </Button>
        </div>

        {error && (
          <Card className="bg-red-500/20 border border-red-500/30 rounded-[18px]">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <IconAlertCircle className="mr-2 h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/8 backdrop-blur-[20px] border border-white/15 rounded-[18px]">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <IconDatabase className="mr-2 h-5 w-5" />
              Debug Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/20 rounded-lg p-4 h-96 overflow-y-auto custom-scrollbar">
              {debugOutput.length > 0 ? (
                <pre className="text-white text-sm whitespace-pre-wrap">
                  {debugOutput.join('\n')}
                </pre>
              ) : (
                <p className="text-white/50 italic">
                  Click &quot;Run Debug&quot; to start the database debugging process
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}