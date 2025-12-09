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
import { useAuth } from '@/contexts/auth-context'
import { 
  IconUser, 
  IconBell, 
  IconTarget, 
  IconSettings, 
  IconChevronDown,
  IconUpload,
  IconCheck,
  IconRobot
} from '@tabler/icons-react'

// Handle saving of Gemini API key
const handleSaveGeminiApiKey = (apiKey: string) => {
  localStorage.setItem('geminiApiKey', apiKey)
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    notifications: true,
    outreach: true,
    integrations: true,
    account: true,
    appearance: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState('')

  // This ensures we only render theme-dependent content after hydration
  useEffect(() => {
    // Use setTimeout to avoid cascading renders warning
    const timer = setTimeout(() => {
      setIsMounted(true)
      // Load Gemini API key from localStorage
      const savedApiKey = localStorage.getItem('geminiApiKey') || ''
      setGeminiApiKey(savedApiKey)
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

  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    // Save Gemini API key
    handleSaveGeminiApiKey(geminiApiKey)
    
    try {
      // In a real implementation, you would save to your database or update user metadata
      // For now, we'll just show a success message
      setTimeout(() => {
        setIsSaving(false)
        // Show success feedback
        alert('Settings saved successfully!')
      }, 1000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setIsSaving(false)
      alert('Error saving settings. Please try again.')
    }
  }

  // Show skeleton/loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-input-bg rounded animate-pulse mb-6 w-1/3"></div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="h-6 bg-input-bg rounded animate-pulse w-1/4 mb-2"></div>
              <div className="h-4 bg-input-bg rounded animate-pulse w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-5 bg-input-bg rounded animate-pulse w-16 mb-2"></div>
                  <div className="h-4 bg-input-bg rounded animate-pulse w-32"></div>
                </div>
                <div className="h-10 bg-input-bg rounded animate-pulse w-40"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Background for Apple-style grainy effect - matching dashboard page */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,29,33,0.8)_0%,rgba(10,10,12,0.95)_100%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im5vaXNlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjEwIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZlVHVyYnVsZW5jZT48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ij48L3JlY3Q+PC9zdmc+')] opacity-10"></div>
      </div>

      <div className="flex flex-col min-h-screen relative z-10 animate-fadeInUp">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-gold-accent hover:bg-gold-dim text-stone-black-1 rounded-[12px] transition-all duration-300 hover:scale-[1.02] flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-black-1 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
        
        {/* Profile Settings Card */}
        <Card className="mb-6 bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('profile')}
          >
            <div>
              <CardTitle className="flex items-center text-text-primary">
                <IconUser className="mr-2 h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-text-secondary">Manage your personal information</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 text-text-primary transition-transform duration-300 ${expandedSections.profile ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.profile && (
            <CardContent className="space-y-5 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-text-primary">Name</Label>
                  <Input id="name" placeholder="Your name" defaultValue={user?.user_metadata?.full_name || user?.user_metadata?.name || ''} className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-primary">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" defaultValue={user?.email || ''} className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow" readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-text-primary">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself" className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] focus:ring-2 focus:ring-gold-glow" rows={3} />
              </div>
              <div className="space-y-2">
                <Label className="text-text-primary">Avatar</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-[12px] bg-input-bg flex items-center justify-center">
                    <IconUser className="h-8 w-8 text-text-muted" />
                  </div>
                  <Button variant="outline" className="h-10 rounded-[12px] border-soft hover:bg-hover-surface text-text-primary transition-colors">
                    <IconUpload className="mr-2 h-4 w-4" />
                    Upload New
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Notifications Card */}
        <Card className="mb-6 bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('notifications')}
          >
            <div>
              <CardTitle className="flex items-center text-text-primary">
                <IconBell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-text-secondary">Configure how you receive notifications</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 text-text-primary transition-transform duration-300 ${expandedSections.notifications ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.notifications && (
            <CardContent className="space-y-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-digest" className="text-text-primary">Daily Digest Email</Label>
                  <p className="text-sm text-text-secondary">Receive a daily summary of your activity</p>
                </div>
                <Switch id="daily-digest" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="follow-up-reminders" className="text-text-primary">Follow-up Reminders</Label>
                  <p className="text-sm text-text-secondary">Get notified about pending follow-ups</p>
                </div>
                <Switch id="follow-up-reminders" defaultChecked />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Daily Outreach Goal Card */}
        <Card className="mb-6 bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('outreach')}
          >
            <div>
              <CardTitle className="flex items-center text-text-primary">
                <IconTarget className="mr-2 h-5 w-5" />
                Daily Outreach Goal
              </CardTitle>
              <CardDescription className="text-text-secondary">Set your daily outreach target</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 text-text-primary transition-transform duration-300 ${expandedSections.outreach ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.outreach && (
            <CardContent className="pb-4">
              <div className="space-y-2">
                <Label htmlFor="outreach-goal" className="text-text-primary">Daily Outreach Target</Label>
                <Input 
                  id="outreach-goal" 
                  type="number" 
                  defaultValue="3" 
                  min="1" 
                  max="20" 
                  className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 w-32 focus:ring-2 focus:ring-gold-glow" 
                />
                <p className="text-sm text-text-secondary">Default is 3 outreaches per day</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Account Settings Card */}
        <Card className="mb-6 bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('account')}
          >
            <div>
              <CardTitle className="flex items-center text-text-primary">
                <IconSettings className="mr-2 h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription className="text-text-secondary">Manage your account security</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 text-text-primary transition-transform duration-300 ${expandedSections.account ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.account && (
            <CardContent className="space-y-5 pb-4">
              <div>
                <Label htmlFor="change-password" className="text-text-primary">Change Password</Label>
                <div className="flex space-x-3 mt-2">
                  <Input 
                    id="change-password" 
                    type="password" 
                    placeholder="New password" 
                    className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 flex-grow focus:ring-2 focus:ring-gold-glow" 
                  />
                  <Button variant="outline" className="h-10 rounded-[12px] border-soft hover:bg-hover-surface text-text-primary transition-colors">
                    Change
                  </Button>
                </div>
              </div>
              <div>
                <Button variant="destructive" className="h-10 rounded-[12px] bg-red-600 hover:bg-red-700 transition-colors">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Appearance Card (existing) */}
        <Card className="mb-6 bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('appearance')}
          >
            <div>
              <CardTitle className="text-text-primary">Appearance</CardTitle>
              <CardDescription className="text-text-secondary">Customize the look and feel of the application</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 text-text-primary transition-transform duration-300 ${expandedSections.appearance ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.appearance && (
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-text-primary">Theme</h3>
                  <p className="text-sm text-text-secondary">
                    Current theme: {getThemeLabel()}
                  </p>
                </div>
                <Button 
                  onClick={toggleTheme} 
                  variant="outline" 
                  className="h-10 rounded-[12px] border-soft hover:bg-hover-surface text-text-primary transition-colors"
                >
                  Switch to {getNextThemeLabel()} Mode
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* AI Integrations Card */}
        <Card className="mb-6 bg-gradient-to-b from-obsidian-soft to-stone-black-2 border border-soft rounded-[18px] shadow-stone transition-all duration-300 hover:shadow-lg">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => toggleSection('integrations')}
          >
            <div>
              <CardTitle className="flex items-center text-text-primary">
                <IconRobot className="mr-2 h-5 w-5" />
                AI Integrations
              </CardTitle>
              <CardDescription className="text-text-secondary">Configure your AI service API keys</CardDescription>
            </div>
            <IconChevronDown 
              className={`h-5 w-5 text-text-primary transition-transform duration-300 ${expandedSections.integrations ? 'rotate-180' : ''}`} 
            />
          </CardHeader>
          {expandedSections.integrations && (
            <CardContent className="space-y-5 pb-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-api-key" className="text-text-primary">Gemini API Key</Label>
                <Input 
                  id="gemini-api-key" 
                  type="password" 
                  placeholder="Enter your Gemini API key" 
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="bg-input-bg border-soft text-text-primary placeholder-text-muted rounded-[12px] h-10 focus:ring-2 focus:ring-gold-glow" 
                />
                <p className="text-sm text-text-secondary">Used for AI-powered client analysis. Get your key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-gold-accent hover:underline">Google AI Studio</a>.</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}