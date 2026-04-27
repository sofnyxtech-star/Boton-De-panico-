'use client'

import { Bell, Volume2, VolumeX, Menu } from 'lucide-react'
import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts'

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const { alerts } = useRealtimeAlerts()
  const activeCount = alerts.filter(a => a.status === 'active').length

  return (
    <header className="fixed top-0 left-0 right-0 z-[1500] h-16 bg-secondary-light border-b border-border md:left-64">
      <div className="flex h-full items-center justify-between px-3 md:px-6">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-3">
          {/* Hamburger - mobile only */}
          <button
            onClick={onMenuToggle}
            className="p-2 text-gray-400 hover:text-white transition-colors md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-sm font-semibold text-white md:text-lg">
            Centro de Monitoreo <span className="hidden sm:inline">24/7</span>
          </h1>
          <div className="hidden sm:block text-sm text-gray-400">
            {formatDateTime(new Date())}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors md:gap-2 md:px-3 md:py-2 md:text-sm ${
              soundEnabled
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
            </span>
          </button>

          {/* Alert Counter */}
          <div className="relative">
            <button className="flex items-center gap-1.5 rounded-lg bg-background-hover px-2 py-1.5 text-xs text-white transition-colors hover:bg-background md:gap-2 md:px-3 md:py-2 md:text-sm">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </button>
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-white animate-pulse-emergency">
                {activeCount}
              </span>
            )}
          </div>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-400">Sistema Operativo</span>
          </div>
        </div>
      </div>
    </header>
  )
}
