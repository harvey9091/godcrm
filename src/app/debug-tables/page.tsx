'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function DebugTablesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Debug Tables</h1>
        <p className="text-text-secondary">Debug tables page content would go here.</p>
      </div>
    </DashboardLayout>
  )
}