# Central Dashboard - Águilas del Sol ADS

Dashboard de monitoreo en tiempo real para la central de operaciones.

## Requisitos

- Node.js 18+
- npm o yarn
- Proyecto Supabase configurado

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales de Supabase
```

## Configuración

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Producción

```bash
npm run build
npm start
```

## Estructura

```
src/
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Dashboard principal
│   ├── login/             # Página de login
│   ├── agents/            # Gestión de agentes
│   ├── alerts/            # Historial de alertas
│   └── reports/           # Reportes y estadísticas
├── components/
│   ├── Dashboard/         # Componentes del dashboard
│   │   ├── LiveMap.tsx    # Mapa en tiempo real
│   │   ├── AlertPanel.tsx # Panel de alertas
│   │   └── StatsBar.tsx   # Barra de estadísticas
│   └── UI/                # Componentes de interfaz
├── hooks/                  # React hooks personalizados
│   ├── useAuth.ts         # Autenticación
│   ├── useRealtimeAlerts.ts # Alertas en tiempo real
│   └── useAgents.ts       # Datos de agentes
├── lib/                    # Utilidades
│   ├── supabase.ts        # Cliente Supabase
│   └── utils.ts           # Funciones auxiliares
└── types/                  # Tipos TypeScript
```

## Funcionalidades

- **Mapa en tiempo real**: Visualización de agentes con ubicación GPS
- **Panel de alertas**: Recepción y gestión de alertas en tiempo real
- **Sonido de alerta**: Notificación sonora al recibir alertas críticas
- **Gestión de agentes**: Lista completa con filtros por estado
- **Historial de alertas**: Búsqueda y filtrado de alertas históricas
- **Reportes**: Gráficos y estadísticas de rendimiento

## Tecnologías

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Leaflet (mapas)
- Supabase (backend)
- Recharts (gráficos)
