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

// AudioContext compartido (creado una sola vez con interaccion del usuario)
let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!sharedAudioContext) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      sharedAudioContext = new Ctor()
    } catch {
      return null
    }
  }
  return sharedAudioContext
}

// Pre-inicializar el AudioContext en la primera interaccion del usuario
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  }
  ['click', 'touchstart', 'keydown'].forEach((evt) =>
    window.addEventListener(evt, unlock, { once: false, capture: true }),
  )
}

// Reproducir sonido de alerta usando Web Audio API (3 beeps)
export function playAlertSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Si esta suspendido (autoplay policy), intentar reanudar
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

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
