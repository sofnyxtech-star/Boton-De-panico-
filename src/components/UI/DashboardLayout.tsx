'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/UI/Sidebar'
import { Header } from '@/components/UI/Header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (mobile navigation)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      <Header onMenuToggle={handleToggleSidebar} />

      <main className="pt-16 p-4 md:ml-64 md:p-6">
        {children}
      </main>
    </div>
  )
}
