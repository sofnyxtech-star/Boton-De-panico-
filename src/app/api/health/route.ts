import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { status: 'error', message: 'Supabase no configurado' },
      { status: 503 },
    )
  }

  try {
    const { error } = await supabase.from('agents').select('id').limit(1)
    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: 'connected',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json(
      { status: 'degraded', message },
      { status: 503 },
    )
  }
}
