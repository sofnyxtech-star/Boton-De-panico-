'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './useAuth'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

type PushStatus = 'idle' | 'unsupported' | 'granted' | 'denied' | 'subscribed' | 'error'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i)
  return buffer
}

export function usePushNotifications() {
  const { operator } = useAuth()
  const [status, setStatus] = useState<PushStatus>('idle')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Detectar soporte y registrar SW
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setStatus('unsupported')
      return
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          setSubscription(existing)
          setStatus('subscribed')
        } else if (Notification.permission === 'granted') {
          setStatus('granted')
        } else if (Notification.permission === 'denied') {
          setStatus('denied')
        }
      })
      .catch((err) => {
        console.error('SW registration failed:', err)
        setStatus('error')
        setError(err.message)
      })
  }, [])

  const subscribe = useCallback(async () => {
    if (!operator?.id) {
      setError('Debes iniciar sesion primero')
      return false
    }
    if (!VAPID_PUBLIC_KEY) {
      setError('VAPID no configurado')
      setStatus('error')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'denied') {
        setStatus('denied')
        return false
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          operatorId: operator.id,
          userAgent: navigator.userAgent,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al registrar suscripcion')
      }

      setSubscription(sub)
      setStatus('subscribed')
      setError(null)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      setStatus('error')
      return false
    }
  }, [operator])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return false
    try {
      const endpoint = subscription.endpoint
      await subscription.unsubscribe()
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      })
      setSubscription(null)
      setStatus('granted')
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      return false
    }
  }, [subscription])

  return {
    status,
    isSubscribed: status === 'subscribed',
    isSupported: status !== 'unsupported',
    error,
    subscribe,
    unsubscribe,
  }
}
