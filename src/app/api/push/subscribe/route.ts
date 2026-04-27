import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface SubscribeBody {
  subscription: PushSubscriptionJSON
  operatorId: string
  userAgent?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: SubscribeBody = await req.json()
    const { subscription, operatorId, userAgent } = body

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Subscripcion invalida' }, { status: 400 })
    }

    if (!operatorId) {
      return NextResponse.json({ error: 'Operador requerido' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          operator_id: operatorId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: userAgent ?? null,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' },
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint requerido' }, { status: 400 })
    }
    const supabase = createServerClient()
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
