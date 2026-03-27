'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Operator } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  operator: Operator | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    operator: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }))
        return
      }
      if (session?.user) {
        fetchOperator(session.user.id)
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
      setState(prev => ({ ...prev, user: session?.user ?? null, session }))
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({ ...prev, user: session?.user ?? null, session }))

        if (session?.user) {
          fetchOperator(session.user.id)
        } else {
          setState(prev => ({ ...prev, operator: null, loading: false }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchOperator = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('auth_id', userId)
        .single()

      if (error) throw error

      setState(prev => ({ ...prev, operator: data, loading: false }))
    } catch (error) {
      console.error('Error fetching operator:', error)
      setState(prev => ({ ...prev, loading: false, error: 'No se encontró el operador' }))
    }
  }

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      return false
    }

    return true
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }))
    await supabase.auth.signOut()
    setState(prev => ({
      ...prev,
      user: null,
      session: null,
      operator: null,
      loading: false,
    }))
  }

  return {
    ...state,
    signIn,
    signOut,
    isAuthenticated: !!state.user && !!state.operator,
    isAdmin: state.operator?.role === 'admin',
    isSupervisor: state.operator?.role === 'supervisor' || state.operator?.role === 'admin',
  }
}
