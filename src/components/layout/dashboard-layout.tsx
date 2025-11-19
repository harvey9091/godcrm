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
  IconSettings
} from '@tabler/icons-react'
import { Toaster } from 'sonner'
import { User } from '@supabase/supabase-js'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: IconLayoutDashboard },
  { name: 'Leads', href: '/clients', icon: IconUsers },
  { name: 'Closed Clients', href: '/assets', icon: IconAsset },
  { name: 'Settings', href: '/settings', icon: IconSettings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarHover, setSidebarHover] = useState(false)
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
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0 w-64' : sidebarHover ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {(sidebarOpen || sidebarHover) && (
            <div className="flex items-center">
              <AnimatedGradientText className="text-xl font-bold">
                GodCRM
              </AnimatedGradientText>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-foreground hover:bg-accent"
          >
            <IconX className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-5 w-5" />
                {(sidebarOpen || sidebarHover) && (
                  <span className="ml-3">{item.name}</span>
                )}
              </a>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border">
          {user && (
            <div className={`flex items-center ${sidebarOpen || sidebarHover ? 'justify-between' : 'justify-center'}`}>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {(sidebarOpen || sidebarHover) && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
              {(sidebarOpen || sidebarHover) && (
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-accent"
                >
                  <IconLogout className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-foreground hover:bg-accent"
          >
            <IconMenu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <AnimatedGradientText className="text-xl font-bold">
              GodCRM
            </AnimatedGradientText>
          </div>
          <div className="w-6" /> {/* Spacer for symmetry */}
        </div>

        {/* Page content with custom scrollbar */}
        <main className="flex-1 overflow-y-auto focus:outline-none custom-scrollbar">
          <div className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  )
}