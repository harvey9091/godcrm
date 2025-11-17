'use client'

import { useTheme } from '@/components/layout/theme-provider'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeTestBackground } from '@/components/theme-test-background'

export default function ThemeTestPage() {
  const { theme, effectiveTheme, setTheme } = useTheme()

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Theme Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Theme Status</CardTitle>
            <CardDescription>Check if theme is applied correctly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Selected Theme:</p>
              <p className="text-lg">{theme}</p>
            </div>
            <div>
              <p className="font-medium">Effective Theme:</p>
              <p className="text-lg">{effectiveTheme}</p>
            </div>
            <ThemeTestBackground />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => setTheme('light')} variant="outline">
            Set Light Theme
          </Button>
          <Button onClick={() => setTheme('dark')} variant="outline">
            Set Dark Theme
          </Button>
          <Button onClick={() => setTheme('system')} variant="outline">
            Set System Theme
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}