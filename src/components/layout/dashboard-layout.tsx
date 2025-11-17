'use client'

import { Sidebar, SidebarBody, SidebarLink, SidebarSignOut } from '@/components/ui/sidebar'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/auth'
import { motion } from 'motion/react'
import { useTheme } from './theme-provider'

const dashboardItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Clients', href: '/clients', icon: '👥' },
  { label: 'Assets', href: '/assets', icon: '📁' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const router = useRouter()
  const { effectiveTheme } = useTheme()

  // Removed useEffect that was causing cascading renders warning
  // The sidebar is initialized as open by default above

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if signOut fails, redirect to login
      router.push('/login')
    }
  }

  return (
    <div className={`flex h-screen ${effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      <Sidebar open={open} setOpen={setOpen} onSignOut={handleSignOut}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold mb-6 px-2"
              >
                GodCRM
              </motion.div>
            )}
            <div className="mt-8 flex flex-col gap-2">
              {dashboardItems.map((item, idx) => (
                <SidebarLink key={idx} link={item} />
              ))}
            </div>
          </div>
          <SidebarSignOut onSignOut={handleSignOut} />
        </SidebarBody>
      </Sidebar>
      <main className={`flex-1 overflow-auto p-6 ${effectiveTheme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
        {children}
      </main>
      {/* Floating dock is installed but not used as per requirements */}
    </div>
  )
}