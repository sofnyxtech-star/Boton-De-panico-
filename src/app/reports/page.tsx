'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { DashboardLayout } from '@/components/UI/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useStats } from '@/hooks/useStats'
import { supabase } from '@/lib/supabase'
import { formatSeconds, formatDate } from '@/lib/utils'

interface DailyReport {
  date: string
  total_alerts: number
  panic_alerts: number
  medical_alerts: number
  fire_alerts: number
  resolved_alerts: number
  false_alarms: number
  avg_response_time: number
}

export default function ReportsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { stats } = useStats()
  const [reports, setReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('week')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports()
    }
  }, [isAuthenticated, dateRange])

  const fetchReports = async () => {
    setLoading(true)

    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase.rpc('get_alerts_report', {
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: new Date().toISOString().split('T')[0],
    })

    if (!error && data) {
      setReports(data)
    }
    setLoading(false)
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner h-16 w-16"></div>
      </div>
    )
  }

  // Chart data transformations
  const alertsByDay = reports.map((r) => ({
    name: formatDate(r.date).slice(0, 5),
    total: r.total_alerts,
    resueltas: r.resolved_alerts,
  }))

  const alertsByType = [
    { name: 'Panico', value: reports.reduce((sum, r) => sum + r.panic_alerts, 0), color: '#ef4444' },
    { name: 'Medica', value: reports.reduce((sum, r) => sum + r.medical_alerts, 0), color: '#ec4899' },
    { name: 'Incendio', value: reports.reduce((sum, r) => sum + r.fire_alerts, 0), color: '#f97316' },
  ].filter((t) => t.value > 0)

  const responseTimeData = reports.map((r) => ({
    name: formatDate(r.date).slice(0, 5),
    tiempo: r.avg_response_time,
  }))

  // Summary stats
  const totalAlerts = reports.reduce((sum, r) => sum + r.total_alerts, 0)
  const totalResolved = reports.reduce((sum, r) => sum + r.resolved_alerts, 0)
  const totalFalseAlarms = reports.reduce((sum, r) => sum + r.false_alarms, 0)
  const avgResponseTime = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.avg_response_time, 0) / reports.length)
    : 0

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between md:mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 md:text-2xl">
            <BarChart3 className="h-6 w-6 text-primary md:h-7 md:w-7" />
            Reportes y Estadisticas
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            Analisis de alertas y rendimiento del sistema
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400 shrink-0" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter')}
            className="w-full px-3 py-2 bg-background-card border border-border rounded-lg text-white focus:border-primary focus:outline-none text-sm sm:w-auto md:px-4"
          >
            <option value="week">Ultima semana</option>
            <option value="month">Ultimo mes</option>
            <option value="quarter">Ultimos 3 meses</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner h-12 w-12"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-4 md:gap-4 md:mb-6">
            <div className="bg-background-card rounded-xl border border-border p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 md:text-sm">Total Alertas</p>
                  <p className="text-xl font-bold text-white md:text-2xl">{totalAlerts}</p>
                </div>
                <div className="p-2 bg-primary/20 rounded-lg md:p-3">
                  <AlertTriangle className="h-5 w-5 text-primary md:h-6 md:w-6" />
                </div>
              </div>
            </div>

            <div className="bg-background-card rounded-xl border border-border p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 md:text-sm">Resueltas</p>
                  <p className="text-xl font-bold text-green-400 md:text-2xl">{totalResolved}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {totalAlerts > 0 ? Math.round((totalResolved / totalAlerts) * 100) : 0}% del total
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg md:p-3">
                  <TrendingUp className="h-5 w-5 text-green-400 md:h-6 md:w-6" />
                </div>
              </div>
            </div>

            <div className="bg-background-card rounded-xl border border-border p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 md:text-sm">Falsas Alarmas</p>
                  <p className="text-xl font-bold text-gray-400 md:text-2xl">{totalFalseAlarms}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {totalAlerts > 0 ? Math.round((totalFalseAlarms / totalAlerts) * 100) : 0}% del total
                  </p>
                </div>
                <div className="p-2 bg-gray-500/20 rounded-lg md:p-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400 md:h-6 md:w-6" />
                </div>
              </div>
            </div>

            <div className="bg-background-card rounded-xl border border-border p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 md:text-sm">Tiempo Promedio</p>
                  <p className="text-xl font-bold text-blue-400 md:text-2xl">{formatSeconds(avgResponseTime)}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">de respuesta</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg md:p-3">
                  <Clock className="h-5 w-5 text-blue-400 md:h-6 md:w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            {/* Alerts by Day */}
            <div className="bg-background-card rounded-xl border border-border p-4 md:p-6">
              <h3 className="text-base font-semibold text-white mb-4 md:text-lg">Alertas por Dia</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={alertsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4e" />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} />
                  <YAxis stroke="#a1a1aa" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #2a2a4e',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" name="Total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resueltas" name="Resueltas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Alerts by Type */}
            <div className="bg-background-card rounded-xl border border-border p-4 md:p-6">
              <h3 className="text-base font-semibold text-white mb-4 md:text-lg">Distribucion por Tipo</h3>
              {alertsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={alertsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {alertsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid #2a2a4e',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500">
                  No hay datos para mostrar
                </div>
              )}
            </div>

            {/* Response Time Trend */}
            <div className="bg-background-card rounded-xl border border-border p-4 lg:col-span-2 md:p-6">
              <h3 className="text-base font-semibold text-white mb-4 md:text-lg">Tiempo de Respuesta Promedio</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4e" />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} />
                  <YAxis stroke="#a1a1aa" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #2a2a4e',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatSeconds(value), 'Tiempo']}
                  />
                  <Line
                    type="monotone"
                    dataKey="tiempo"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
