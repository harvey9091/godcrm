'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function DebugTablesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Debug Tables</h1>
        <p className="text-white/70">Debug tables page content would go here.</p>
      </div>
    </DashboardLayout>
  )
}