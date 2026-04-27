import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'

// Combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatear fecha relativa
export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: es,
  })
}

// Formatear fecha completa
export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: es })
}

// Formatear fecha corta
export function formatDate(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy", { locale: es })
}

// Formatear hora
export function formatTime(date: string | Date) {
  return format(new Date(date), "HH:mm:ss", { locale: es })
}

// Formatear segundos a tiempo legible
export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}m`
}

// Formatear nivel de batería
export function formatBattery(level: number | null): string {
  if (level === null) return 'N/A'
  if (level > 75) return `🔋 ${level}%`
  if (level > 25) return `🪫 ${level}%`
  return `🔴 ${level}%`
}

// Obtener color de batería
export function getBatteryColor(level: number | null): string {
  if (level === null) return 'text-gray-400'
  if (level > 75) return 'text-green-400'
  if (level > 50) return 'text-yellow-400'
  if (level > 25) return 'text-orange-400'
  return 'text-red-400'
}

// Reproducir sonido de alerta usando Web Audio API (3 beeps)
export function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const BEEP_DURATION = 0.15
    const BEEP_PAUSE = 0.1
    const BEEP_FREQUENCY = 880
    const BEEP_COUNT = 3

    for (let i = 0; i < BEEP_COUNT; i++) {
      const startTime = ctx.currentTime + i * (BEEP_DURATION + BEEP_PAUSE)

      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(BEEP_FREQUENCY, startTime)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01)
      gain.gain.setValueAtTime(0.3, startTime + BEEP_DURATION - 0.01)
      gain.gain.linearRampToValueAtTime(0, startTime + BEEP_DURATION)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + BEEP_DURATION)
    }

    const totalDuration = BEEP_COUNT * (BEEP_DURATION + BEEP_PAUSE)
    setTimeout(() => { ctx.close().catch(() => { /* already closed */ }) }, totalDuration * 1000 + 100)
  } catch (err) {
    console.error('Error playing alert sound:', err)
  }
}

// Generar iniciales
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Truncar texto
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Wrapper con retry exponencial para llamadas a Supabase
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 500,
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i === retries) break
      const delay = baseDelay * Math.pow(2, i)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastError
}
