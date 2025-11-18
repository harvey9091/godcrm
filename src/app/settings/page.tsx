'use client'

import { useTheme } from '@/components/layout/theme-provider'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useEffect, useState } from 'react'
import { 
  IconUser, 
  IconMail, 
  IconBell, 
  IconTarget, 
  IconPlug, 
  IconSettings, 
  IconChevronDown,
  IconUpload,
  IconBrandGoogle,
  IconBrandLoom
} from '@tabler/icons-react'

// Add a small comment to refresh TypeScript
// This is a refresh comment

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    notifications: true,
    outreach: true,
    integrations: true,
    account: true,
    appearance: true
  })

  // This ensures we only render theme-dependent content after hydration
  useEffect(() => {
    // Use setTimeout to avoid cascading renders warning
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 0)
    
    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] })
  }

  const getThemeLabel = () => {
    if (theme === 'light') return 'Light'
    if (theme === 'dark') return 'Dark'
    return 'System'
  }

  const getNextThemeLabel = () => {
    if (theme === 'light') return 'Dark'
    if (theme === 'dark') return 'System'
    return 'Light'
  }

  // Show skeleton/loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-1/3"></div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-40"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        {/* Profile Settings Card */}
        <Card className="mb-6 bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('profile')}
          >
            <div>
              <CardTitle className="flex items-center">
                <IconUser className="mr-2 h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 transition-transform ${expandedSections.profile ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.profile && (
            <CardContent className="space-y-5 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" className="h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" className="h-10 rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself" className="rounded-lg" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <IconUser className="h-8 w-8 text-gray-500" />
                  </div>
                  <Button variant="outline" className="h-10 rounded-lg">
                    <IconUpload className="mr-2 h-4 w-4" />
                    Upload New
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Notifications Card */}
        <Card className="mb-6 bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('notifications')}
          >
            <div>
              <CardTitle className="flex items-center">
                <IconBell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 transition-transform ${expandedSections.notifications ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.notifications && (
            <CardContent className="space-y-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-digest">Daily Digest Email</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of your activity</p>
                </div>
                <Switch id="daily-digest" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="follow-up-reminders">Follow-up Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get notified about pending follow-ups</p>
                </div>
                <Switch id="follow-up-reminders" defaultChecked />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Daily Outreach Goal Card */}
        <Card className="mb-6 bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('outreach')}
          >
            <div>
              <CardTitle className="flex items-center">
                <IconTarget className="mr-2 h-5 w-5" />
                Daily Outreach Goal
              </CardTitle>
              <CardDescription>Set your daily outreach target</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 transition-transform ${expandedSections.outreach ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.outreach && (
            <CardContent className="pb-4">
              <div className="space-y-2">
                <Label htmlFor="outreach-goal">Daily Outreach Target</Label>
                <Input 
                  id="outreach-goal" 
                  type="number" 
                  defaultValue="3" 
                  min="1" 
                  max="20" 
                  className="h-10 rounded-lg w-32" 
                />
                <p className="text-sm text-muted-foreground">Default is 3 outreaches per day</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Integrations Card */}
        <Card className="mb-6 bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('integrations')}
          >
            <div>
              <CardTitle className="flex items-center">
                <IconPlug className="mr-2 h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>Connect your favorite tools</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 transition-transform ${expandedSections.integrations ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.integrations && (
            <CardContent className="space-y-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <IconBrandGoogle className="h-6 w-6 text-red-500 mr-3" />
                  <div>
                    <Label>Google Drive</Label>
                    <p className="text-sm text-muted-foreground">Connect to manage files</p>
                  </div>
                </div>
                <Button variant="outline" className="h-9 rounded-lg">
                  Connected
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <IconBrandLoom className="h-6 w-6 text-purple-500 mr-3" />
                  <div>
                    <Label>Loom</Label>
                    <p className="text-sm text-muted-foreground">Connect to share videos</p>
                  </div>
                </div>
                <Button variant="outline" className="h-9 rounded-lg">
                  Connect
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Account Settings Card */}
        <Card className="mb-6 bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('account')}
          >
            <div>
              <CardTitle className="flex items-center">
                <IconSettings className="mr-2 h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 transition-transform ${expandedSections.account ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.account && (
            <CardContent className="space-y-5 pb-4">
              <div>
                <Label htmlFor="change-password">Change Password</Label>
                <div className="flex space-x-3 mt-2">
                  <Input 
                    id="change-password" 
                    type="password" 
                    placeholder="New password" 
                    className="h-10 rounded-lg" 
                  />
                  <Button variant="outline" className="h-10 rounded-lg">
                    Change
                  </Button>
                </div>
              </div>
              <div>
                <Button variant="destructive" className="h-10 rounded-lg">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Appearance Card (existing) */}
        <Card className="mb-6 bg-card/30 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('appearance')}
          >
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 transition-transform ${expandedSections.appearance ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.appearance && (
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Current theme: {getThemeLabel()}
                  </p>
                </div>
                <Button onClick={toggleTheme} variant="outline" className="h-10 rounded-lg">
                  Switch to {getNextThemeLabel()} Mode
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}