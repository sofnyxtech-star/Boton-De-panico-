'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'

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

      // Limpiar suscripcion previa si existe
      const existingSub = await reg.pushManager.getSubscription()
      if (existingSub) {
        await existingSub.unsubscribe()
      }

      let sub: PushSubscription
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
      } catch (subErr) {
        const errMsg = subErr instanceof Error ? subErr.message : String(subErr)
        const errName = subErr instanceof Error ? subErr.name : 'Error'
        console.error('[Push] subscribe error:', errName, errMsg, subErr)

        let userMessage = errMsg
        if (errName === 'NotAllowedError') {
          userMessage = 'El navegador bloqueo las notificaciones. Habilitalas en configuracion del sitio.'
        } else if (errName === 'AbortError') {
          userMessage = 'El servicio push fallo. En iOS necesitas instalar la app primero (Compartir > Agregar a inicio).'
        } else if (errName === 'InvalidStateError') {
          userMessage = 'El service worker no esta listo. Recarga la pagina e intenta de nuevo.'
        } else if (errMsg.includes('push service')) {
          userMessage = 'Tu navegador o dispositivo no soporta Web Push. Prueba en Chrome/Edge desktop o Android.'
        }
        setError(userMessage)
        setStatus('error')
        return false
      }

      // Insert directo desde el cliente (con sesion autenticada)
      const subJson = sub.toJSON()
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            operator_id: operator.id,
            endpoint: subJson.endpoint!,
            p256dh: subJson.keys!.p256dh,
            auth: subJson.keys!.auth,
            user_agent: navigator.userAgent,
            last_used_at: new Date().toISOString(),
          },
          { onConflict: 'endpoint' },
        )

      if (dbError) {
        console.error('[Push] DB insert error:', dbError)
        throw new Error(dbError.message)
      }

      setSubscription(sub)
      setStatus('subscribed')
      setError(null)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      console.error('[Push] subscribe outer error:', err)
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
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
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
