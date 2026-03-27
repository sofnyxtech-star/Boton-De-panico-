import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Desactivar StrictMode para evitar doble renderizado del mapa
  reactStrictMode: false,
  // Habilitar imágenes de Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Configuración experimental
  experimental: {
    // Habilitar Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
