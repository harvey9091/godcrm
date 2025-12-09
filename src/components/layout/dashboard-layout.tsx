'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getSession, signOut } from '@/lib/supabase/auth'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { Button } from '@/components/ui/button'
import { 
  IconLayoutDashboard, 
  IconUsers, 
  IconAsset, 
  IconLogout,
  IconMenu,
  IconX,
  IconSettings,
  IconRobot
} from '@tabler/icons-react'
import { Toaster } from 'sonner'
import { User } from '@supabase/supabase-js'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: IconLayoutDashboard },
  { name: 'Leads', href: '/clients', icon: IconUsers },
  { name: 'Closed Clients', href: '/closedclients', icon: IconAsset },
  { name: 'AI Analysis', href: '/ai-analysis', icon: IconRobot },
  { name: 'Settings', href: '/settings', icon: IconSettings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await getSession()
        if (!data.session) {
          router.push('/login')
        } else {
          setUser(data.session.user)
        }
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex h-screen bg-stone-black-1">
      {/* Background vignette for depth */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,30,45,0.6)_0%,rgba(15,15,30,0.9)_100%)] pointer-events-none z-0"></div>
      
      {/* Frosted container behind content */}
      <div className="fixed inset-4 bg-stone-black-2/50 backdrop-blur-3xl rounded-3xl border border-soft shadow-stone pointer-events-none z-0"></div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 w-64`}
      >
        <div 
          className={`flex items-center justify-between h-16 px-4 border-b border-soft transition-all duration-300 rounded-t-3xl bg-stone-gradient-card backdrop-blur-[20px]`}
        >
          {sidebarOpen && (
            <div className="flex items-center">
              <AnimatedGradientText className="text-2xl font-bold text-text-primary">
                GodCRM
              </AnimatedGradientText>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-text-primary hover:bg-hover-surface"
          >
            <IconX className="h-6 w-6" />
          </button>
        </div>
        <nav 
          className={`flex-1 px-3 py-5 space-y-2 transition-all duration-300 bg-stone-gradient-card backdrop-blur-[20px]`}
        >
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-4 text-base font-medium rounded-[18px] transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-stone-grey-deep to-stone-black-2 text-gold-accent shadow-gold-glow border border-soft'
                    : 'text-text-secondary hover:bg-hover-surface hover:text-text-primary hover:border-soft'
                }`}
              >
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-stone-grey-deep shadow-inner border border-soft text-gold-accent' 
                    : 'bg-stone-black-2 text-text-secondary'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="ml-4">{item.name}</span>
              </a>
            )
          })}
        </nav>
        <div 
          className={`p-5 border-t border-soft transition-all duration-300 rounded-b-3xl bg-stone-gradient-card backdrop-blur-[20px]`}
        >
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-[18px] bg-gradient-to-r from-stone-grey-deep to-stone-black-2 flex items-center justify-center shadow-lg border border-soft">
                  <span className="text-text-primary text-lg font-medium">
                    {(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-text-primary truncate max-w-[140px]">
                    {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="icon"
                className="text-text-primary hover:bg-hover-surface h-10 w-10"
              >
                <IconLogout className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden relative z-10 border-l border-soft">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-soft bg-stone-gradient-card backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-text-primary hover:bg-hover-surface"
          >
            <IconMenu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <AnimatedGradientText className="text-2xl font-bold text-white">
              GodCRM
            </AnimatedGradientText>
          </div>
          <div className="w-6" /> {/* Spacer for symmetry */}
        </div>

        {/* Page content with custom scrollbar */}
        <main className="flex-1 overflow-y-auto focus:outline-none custom-scrollbar py-6 px-4 sm:px-6 lg:px-8 bg-stone-black-1 min-h-screen">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #9b5cff, #8b5cf6);
          border-radius: 10px;
          box-shadow: 0 0 4px rgba(155, 92, 255, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #8b5cf6, #9b5cff);
        }
      `}</style>
    </div>
  )
}