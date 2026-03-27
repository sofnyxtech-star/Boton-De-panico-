// =====================================================
// TIPOS TYPESCRIPT - Águilas del Sol ADS
// =====================================================

// Estados del agente
export type AgentStatus = 'available' | 'patrolling' | 'fixed_post' | 'emergency' | 'offline'

// Tipos de alerta
export type AlertType = 'panic' | 'medical' | 'fire' | 'test'

// Prioridad de alerta
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low'

// Estado de alerta
export type AlertStatus = 'active' | 'acknowledged' | 'responding' | 'resolved' | 'false_alarm'

// Método de activación
export type ActivationMethod = 'button' | 'shake' | 'power_button' | 'widget' | 'voice'

// Rol de operador
export type OperatorRole = 'operator' | 'supervisor' | 'admin'

// Turno de trabajo
export type WorkShift = 'day' | 'night' | 'rotating'

// =====================================================
// INTERFACES
// =====================================================

export interface Operator {
  id: string
  auth_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: OperatorRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  auth_id: string | null
  code: string
  first_name: string
  last_name: string
  dni: string
  phone: string | null
  email: string | null
  photo_url: string | null
  position: string | null
  assigned_zone: string | null
  assigned_client: string | null
  shift: WorkShift
  status: AgentStatus
  current_lat: number | null
  current_lng: number | null
  last_location_update: string | null
  device_token: string | null
  device_model: string | null
  app_version: string | null
  battery_level: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  agent_id: string
  agent?: Agent
  alert_type: AlertType
  priority: AlertPriority
  latitude: number
  longitude: number
  address: string | null
  activation_method: ActivationMethod
  audio_url: string | null
  audio_duration: number | null
  status: AlertStatus
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved_by: string | null
  resolved_at: string | null
  resolution_notes: string | null
  response_time_seconds: number | null
  created_at: string
}

export interface AlertLocation {
  id: string
  alert_id: string
  latitude: number
  longitude: number
  accuracy: number | null
  altitude: number | null
  speed: number | null
  heading: number | null
  recorded_at: string
}

export interface AgentLocationHistory {
  id: string
  agent_id: string
  latitude: number
  longitude: number
  battery_level: number | null
  recorded_at: string
}

// =====================================================
// TIPOS PARA FUNCIONES DE SUPABASE
// =====================================================

export interface DashboardStats {
  agents: {
    total: number
    available: number
    patrolling: number
    fixed_post: number
    emergency: number
    offline: number
  }
  alerts: {
    active: number
    acknowledged: number
    responding: number
    resolved_today: number
    total_today: number
  }
  response: {
    avg_time_today: number
    avg_time_week: number
  }
}

export interface ActiveAlert {
  alert_id: string
  alert_type: AlertType
  priority: AlertPriority
  status: AlertStatus
  latitude: number
  longitude: number
  address: string | null
  activation_method: ActivationMethod
  audio_url: string | null
  created_at: string
  agent_id: string
  agent_code: string
  agent_name: string
  agent_phone: string | null
  agent_position: string | null
  agent_zone: string | null
}

export interface AgentWithLocation {
  id: string
  code: string
  full_name: string
  agent_position: string | null
  assigned_zone: string | null
  assigned_client: string | null
  status: AgentStatus
  latitude: number | null
  longitude: number | null
  battery_level: number | null
  last_update: string | null
  has_active_alert: boolean
}

// =====================================================
// TIPOS DE UI
// =====================================================

export interface StatusConfig {
  label: string
  color: string
  bgColor: string
  icon: string
}

export const AGENT_STATUS_CONFIG: Record<AgentStatus, StatusConfig> = {
  available: {
    label: 'Disponible',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
    icon: '🟢',
  },
  patrolling: {
    label: 'Patrullando',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    icon: '🔵',
  },
  fixed_post: {
    label: 'En Puesto Fijo',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    icon: '🟡',
  },
  emergency: {
    label: 'Emergencia',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
    icon: '🔴',
  },
  offline: {
    label: 'Desconectado',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500',
    icon: '⚫',
  },
}

export const ALERT_PRIORITY_CONFIG: Record<AlertPriority, StatusConfig> = {
  critical: {
    label: 'Crítica',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
    icon: '🚨',
  },
  high: {
    label: 'Alta',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    icon: '⚠️',
  },
  medium: {
    label: 'Media',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    icon: '⚡',
  },
  low: {
    label: 'Baja',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    icon: 'ℹ️',
  },
}

export const ALERT_TYPE_CONFIG: Record<AlertType, StatusConfig> = {
  panic: {
    label: 'Pánico',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
    icon: '🆘',
  },
  medical: {
    label: 'Médica',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500',
    icon: '🏥',
  },
  fire: {
    label: 'Incendio',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    icon: '🔥',
  },
  test: {
    label: 'Prueba',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500',
    icon: '🧪',
  },
}
