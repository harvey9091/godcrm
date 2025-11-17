'use client'

import { Sidebar, SidebarBody, SidebarLink, SidebarSignOut } from '@/components/ui/sidebar'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/auth'
import { motion } from 'motion/react'

const dashboardItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Clients', href: '/clients', icon: '👥' },
  { label: 'Assets', href: '/assets', icon: '📁' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeLayout = async () => {
      // Move state updates to after any async operations
      setIsMounted(true)
      setOpen(true)
    }
    
    initializeLayout()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (!isMounted) {
    return <div className="flex h-screen bg-gray-50">{children}</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
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
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
      {/* Floating dock is installed but not used as per requirements */}
    </div>
  )
}