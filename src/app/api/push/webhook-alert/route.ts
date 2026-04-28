import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@aguilasdelsol.com'
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
}

interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: {
    id: string
    agent_id: string
    alert_type: string
    priority: string
    latitude: number
    longitude: number
    status: string
    created_at: string
  }
  old_record?: unknown
}

export async function POST(req: NextRequest) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json({ error: 'VAPID no configurado' }, { status: 503 })
  }

  // Validar secret del webhook
  const headerSecret = req.headers.get('x-webhook-secret')
  if (WEBHOOK_SECRET && headerSecret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Secret invalido' }, { status: 401 })
  }

  try {
    const payload: SupabaseWebhookPayload = await req.json()

    if (payload.type !== 'INSERT' || payload.table !== 'alerts') {
      return NextResponse.json({ skipped: true, reason: 'No es INSERT en alerts' })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Obtener datos del agente
    const { data: agent } = await supabase
      .from('agents')
      .select('code, first_name, last_name, assigned_zone, phone')
      .eq('id', payload.record.agent_id)
      .single()

    // Obtener todas las suscripciones
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    if (subsError) {
      return NextResponse.json({ error: subsError.message }, { status: 500 })
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No hay suscripciones' })
    }

    const agentName = agent ? `${agent.first_name} ${agent.last_name}` : 'Agente'
    const agentCode = agent?.code || 'Sin codigo'
    const zone = agent?.assigned_zone || 'Ubicacion desconocida'

    const alertTypeLabels: Record<string, string> = {
      panic: 'PANICO',
      medical: 'MEDICA',
      fire: 'INCENDIO',
      test: 'PRUEBA',
    }

    const notificationPayload = JSON.stringify({
      title: `ALERTA DE ${alertTypeLabels[payload.record.alert_type] || 'EMERGENCIA'}`,
      body: `${agentCode} - ${agentName}\n${zone}`,
      url: '/?alertId=' + payload.record.id,
      tag: 'alert-' + payload.record.id,
      alertId: payload.record.id,
    })

    const expiredEndpoints: string[] = []
    let sent = 0
    let failed = 0

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            notificationPayload,
          )
          sent++
        } catch (err: unknown) {
          failed++
          const statusCode = (err as { statusCode?: number })?.statusCode
          if (statusCode === 404 || statusCode === 410) {
            expiredEndpoints.push(sub.endpoint)
          }
        }
      }),
    )

    if (expiredEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
    }

    return NextResponse.json({
      sent,
      failed,
      total: subs.length,
      alertId: payload.record.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[Webhook] Error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
