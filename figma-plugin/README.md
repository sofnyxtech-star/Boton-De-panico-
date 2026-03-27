# Aguilas del Sol - Figma Dashboard Generator

Plugin de Figma que genera automaticamente el Design System completo y el layout del dashboard.

## Que genera

| Pagina | Contenido |
|--------|-----------|
| **Design Tokens** | Paleta de colores (30+ swatches), escala tipografica, escala de spacing |
| **Components** | Buttons (6 variantes), Cards (3 tipos), Badges de status (5 estados) |
| **Dashboard - Main** | Layout completo 1920x1080: Sidebar, Header, StatsBar, LiveMap, AlertPanel |
| **Login** | Pagina de login con formulario centrado |

Ademas crea automaticamente:
- **30+ Paint Styles** (colores reutilizables en todo Figma)
- **9 Text Styles** (tipografia Inter con pesos y tamanos)

## Como ejecutar

### Paso 1: Abrir Figma Desktop
El plugin solo funciona en la app de escritorio de Figma.

### Paso 2: Crear un archivo nuevo
Abre un nuevo archivo de Figma (File > New design file).

### Paso 3: Importar el plugin
1. Ve a **Menu > Plugins > Development > Import plugin from manifest...**
2. Navega a esta carpeta: `central_dashboard/figma-plugin/`
3. Selecciona el archivo `manifest.json`

### Paso 4: Ejecutar el plugin
1. Ve a **Menu > Plugins > Development > Aguilas del Sol - Dashboard Generator**
2. Espera ~10-15 segundos mientras genera todo
3. Veras notificaciones de progreso en la parte inferior

### Resultado
Se generaran 4 paginas con todo el design system y layouts del dashboard.

## Requisitos
- Figma Desktop App (no funciona en web por limitaciones de plugins de desarrollo)
- Fuente Inter instalada (viene por defecto en Figma)

## Estructura del plugin
```
figma-plugin/
  manifest.json   → Configuracion del plugin
  code.js         → Logica de generacion (sin dependencias externas)
```
