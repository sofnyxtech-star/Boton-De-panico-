import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@aguilasdelsol.com'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
}

interface SendBody {
  title: string
  body: string
  url?: string
  alertId?: string
  tag?: string
}

export async function POST(req: NextRequest) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json(
      { error: 'VAPID keys no configuradas en el servidor' },
      { status: 503 },
    )
  }

  try {
    const payload: SendBody = await req.json()
    if (!payload.title || !payload.body) {
      return NextResponse.json({ error: 'title y body requeridos' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No hay suscripciones' })
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      tag: payload.tag || 'alert',
      alertId: payload.alertId,
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
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
    }

    return NextResponse.json({ sent, failed, total: subs.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
