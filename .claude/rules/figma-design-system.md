# Figma Design System Rules - Águilas del Sol Dashboard

## Component Organization

- IMPORTANT: UI components reutilizables van en `src/components/UI/`
- IMPORTANT: Componentes específicos del dashboard van en `src/components/Dashboard/`
- Pages van en `src/app/[route]/page.tsx` (Next.js App Router)
- Custom hooks van en `src/hooks/`
- Types/interfaces van en `src/types/index.ts`
- Utilidades van en `src/lib/`

## Naming Conventions

- Componentes React: PascalCase (`AlertPanel.tsx`, `StatsBar.tsx`)
- Hooks: camelCase con prefijo `use` (`useAuth.ts`, `useRealtimeAlerts.ts`)
- Utilidades: camelCase (`supabase.ts`, `utils.ts`)
- Directorios: lowercase (`components/`, `hooks/`, `lib/`)
- Props interfaces: `[ComponentName]Props`
- Booleans: prefijo `is`/`has` (`isAuthenticated`, `hasActiveAlert`)
- Handlers: prefijo `on` (`onSelectAlert`, `onClick`)

## Import Pattern

- IMPORTANT: Siempre usar path alias `@/*` para imports
```typescript
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import type { Agent } from '@/types'
import { Sidebar } from '@/components/UI/Sidebar'
```

## Color Palette - Tokens Corporativos

IMPORTANT: Nunca hardcodear colores hex. Siempre usar las clases de Tailwind definidas en `tailwind.config.ts`.

### Primary (Gold - Marca Águilas del Sol)
| Token | Hex | Clase Tailwind |
|-------|-----|----------------|
| primary | #f59e0b | `bg-primary`, `text-primary`, `border-primary` |
| primary-50 | #fffbeb | `bg-primary-50` |
| primary-100 | #fef3c7 | `bg-primary-100` |
| primary-200 | #fde68a | `bg-primary-200` |
| primary-300 | #fcd34d | `bg-primary-300` |
| primary-400 | #fbbf24 | `bg-primary-400` |
| primary-500 | #f59e0b | `bg-primary-500` |
| primary-600 | #d97706 | `bg-primary-600` (hover) |
| primary-700 | #b45309 | `bg-primary-700` |
| primary-800 | #92400e | `bg-primary-800` |
| primary-900 | #78350f | `bg-primary-900` |

### Secondary (Dark - Fondos)
| Token | Hex | Uso |
|-------|-----|-----|
| secondary | #0a0a0a | Fondo principal |
| secondary-light | #1a1a2e | Sidebar, Header, Cards |
| secondary-lighter | #2a2a4e | Hover states |

### Semantic Colors
| Token | Hex | Uso |
|-------|-----|-----|
| danger / #dc2626 | Alertas críticas, errores |
| danger-light / #ef4444 | Hover de danger |
| danger-dark / #991b1b | Pressed de danger |
| success / #22c55e | Online, resuelto, éxito |
| success-light / #4ade80 | Hover de success |
| warning / #eab308 | Precaución, en proceso |
| warning-light / #facc15 | Hover de warning |

### Background System
| Token | Hex | Uso |
|-------|-----|-----|
| background | #0a0a0a | Body, fondo general |
| background-card | #1a1a2e | Cards, paneles, sidebar |
| background-hover | #2a2a4e | Estados hover |

### Border System
| Token | Hex | Uso |
|-------|-----|-----|
| border | #2a2a4e | Bordes de cards y separadores |
| border-light | #3a3a5e | Bordes sutiles, scrollbar thumb |

### Text Colors (Tailwind defaults usados)
| Clase | Uso |
|-------|-----|
| `text-white` | Texto principal |
| `text-gray-400` | Labels, texto secundario |
| `text-gray-300` | Texto terciario |
| `text-gray-500` | Texto sutil, placeholders |
| `text-primary` | Acentos dorados |
| `text-red-400` | Alertas, errores |
| `text-green-400` | Éxito, online |
| `text-yellow-400` | Advertencias |
| `text-blue-400` | Información |

## Typography

### Font Families
```
font-sans: Inter, system-ui, sans-serif    → Texto general
font-mono: JetBrains Mono, monospace       → Código, datos técnicos
```

### Font Scale
| Clase | Tamaño | Uso |
|-------|--------|-----|
| `text-xs` | 12px | Metadata, badges, timestamps |
| `text-sm` | 14px | Labels, info secundaria |
| (base) | 16px | Texto body |
| `text-lg` | 18px | Títulos de cards, secciones |
| `text-xl` | 20px | Subtítulos de página |
| `text-2xl` | 24px | Valores de stats |
| `text-3xl` | 30px | Títulos principales (login) |

### Font Weights
| Clase | Peso | Uso |
|-------|------|-----|
| `font-medium` | 500 | Botones, labels, sub-headers |
| `font-semibold` | 600 | Títulos de cards, secciones |
| `font-bold` | 700 | Valores de stats, títulos de página |

## Spacing System

### Standard Gaps
| Valor | Uso |
|-------|-----|
| `gap-1` (4px) | Entre icono y texto en badges |
| `gap-2` (8px) | Entre icono y texto general |
| `gap-3` (12px) | Entre elementos de grupo |
| `gap-4` (16px) | Entre cards en grids |
| `gap-6` (24px) | Padding de secciones principales |

### Padding Patterns
| Pattern | Uso |
|---------|-----|
| `p-3` | Componentes pequeños (AudioPlayer) |
| `p-4` | Cards estándar |
| `p-6` | Secciones principales, sidebar |
| `px-3 py-2` | Botones |
| `px-6` | Header horizontal |

## Component Patterns

### Card Base
```html
<div class="bg-background-card rounded-lg border border-border p-4">
```

### Button Variants
```html
<!-- Primary -->
<button class="rounded-lg px-3 py-2 text-sm font-medium bg-primary hover:bg-primary-600 text-white transition-colors">

<!-- Danger -->
<button class="rounded-lg px-3 py-2 text-sm font-medium bg-danger hover:bg-danger-light text-white transition-colors">

<!-- Success -->
<button class="rounded-lg px-3 py-2 text-sm font-medium bg-success hover:bg-success-dark text-white transition-colors">

<!-- Ghost / Secondary -->
<button class="rounded-lg px-3 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">

<!-- Disabled state -->
<button class="... disabled:opacity-50 disabled:cursor-not-allowed">
```

### Responsive Grid
```html
<!-- 4 columnas (stats) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<!-- 3 columnas (agents) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Flex Patterns
```html
<!-- Icon + Text -->
<div class="flex items-center gap-2">

<!-- Spread content -->
<div class="flex items-center justify-between">

<!-- Vertical stack -->
<div class="flex flex-col gap-2">
```

### Glass Effect
```css
.glass { background: rgba(26, 26, 46, 0.8); backdrop-filter: blur(10px); }
```

## Custom Animations

| Clase | Uso | Duración |
|-------|-----|----------|
| `animate-pulse-slow` | Pulso suave general | 3s infinite |
| `animate-pulse-emergency` | Alerta activa (scale + shadow rojo) | 1s infinite |
| `animate-border-pulse` | Borde pulsante en alertas | 2s infinite |
| `animate-slide-in` | Entrada lateral (notificaciones) | 0.3s ease-out |
| `animate-fade-in` | Fade in general | 0.3s ease-out |

## Z-Index Hierarchy

| z-index | Elemento |
|---------|----------|
| `z-30` | Header |
| `z-40` | Sidebar |
| `z-50` | Modales/Dialogs |
| `z-[1000]` | Overlays del mapa (Leaflet) |

## Layout Structure

```
┌──────────────────────────────────────────────┐
│ Sidebar (w-64, fixed left, z-40)             │
│ ┌──────────────────────────────────────────┐ │
│ │ Header (h-16, fixed top, left: 64, z-30) │ │
│ │ ┌──────────────────────────────────────┐ │ │
│ │ │ Main Content (ml-64, pt-16, p-6)    │ │ │
│ │ │                                      │ │ │
│ │ │  ┌─────────────────┐ ┌───────────┐  │ │ │
│ │ │  │ StatsBar (grid) │ │AlertPanel │  │ │ │
│ │ │  ├─────────────────┤ │ (right)   │  │ │ │
│ │ │  │ LiveMap          │ │           │  │ │ │
│ │ │  └─────────────────┘ └───────────┘  │ │ │
│ │ └──────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## Status Color System

### Agent Status
| Estado | Text Color | Background | Indicador |
|--------|-----------|------------|-----------|
| available | `text-green-400` | `bg-green-500` | Verde sólido |
| patrolling | `text-blue-400` | `bg-blue-500` | Azul sólido |
| fixed_post | `text-yellow-400` | `bg-yellow-500` | Amarillo sólido |
| emergency | `text-red-400` | `bg-red-500` | Rojo + ping animation |
| offline | `text-gray-400` | `bg-gray-500` | Gris sólido |

### Alert Priority
| Prioridad | Color | Badge |
|-----------|-------|-------|
| critical | `text-red-400` / `bg-red-500` | Rojo pulsante |
| high | `text-orange-400` / `bg-orange-500` | Naranja |
| medium | `text-yellow-400` / `bg-yellow-500` | Amarillo |
| low | `text-blue-400` / `bg-blue-500` | Azul |

## Icon System

- IMPORTANT: Usar exclusivamente `lucide-react` para iconos
- Tamaño estándar: `w-5 h-5` (20px)
- Tamaño pequeño: `w-4 h-4` (16px)
- Tamaño grande: `w-6 h-6` (24px)
- NO instalar paquetes de iconos adicionales

## Figma MCP Integration Flow

Cuando se implemente un diseño de Figma:

1. Obtener `get_design_context` para el nodo
2. Obtener `get_screenshot` como referencia visual
3. Mapear colores de Figma a los tokens de `tailwind.config.ts`
4. Reusar componentes existentes de `src/components/UI/` y `src/components/Dashboard/`
5. Usar `cn()` de `@/lib/utils` para merge de clases
6. Mantener paridad visual 1:1 con el diseño de Figma
7. Validar contra el screenshot antes de completar

## Asset Handling

- IMPORTANT: Si Figma MCP devuelve una fuente localhost para imagen/SVG, usar esa fuente directamente
- IMPORTANT: NO importar nuevos paquetes de iconos - usar `lucide-react`
- Assets estáticos van en `public/`
- Sonidos de alerta en `public/sounds/`

## Architecture Rules

- Todos los componentes de página son Client Components (`'use client'`)
- Leaflet/Maps siempre con `dynamic()` import + `ssr: false`
- State management con custom hooks (no Redux/Context global)
- Real-time data via Supabase Realtime subscriptions
- Usar `cn()` para merge condicional de clases Tailwind
- Responsive mobile-first: siempre empezar con `grid-cols-1` y escalar
