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
        <h1 className="text-3xl font-bold text-text-primary">Theme Test</h1>
        
        <Card className="bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone">
          <CardHeader>
            <CardTitle className="text-text-primary">Current Theme Status</CardTitle>
            <CardDescription className="text-text-secondary">Check if theme is applied correctly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-text-primary">Selected Theme:</p>
              <p className="text-lg text-text-primary">{theme}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary">Effective Theme:</p>
              <p className="text-lg text-text-primary">{effectiveTheme}</p>
            </div>
            <ThemeTestBackground />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => setTheme('light')} variant="outline" className="border-soft text-text-primary hover:bg-hover-surface rounded-[12px] transition-colors">
            Set Light Theme
          </Button>
          <Button onClick={() => setTheme('dark')} variant="outline" className="border-soft text-text-primary hover:bg-hover-surface rounded-[12px] transition-colors">
            Set Dark Theme
          </Button>
          <Button onClick={() => setTheme('system')} variant="outline" className="border-soft text-text-primary hover:bg-hover-surface rounded-[12px] transition-colors">
            Set System Theme
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}