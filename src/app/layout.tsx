import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { PWARegister } from '@/components/PWARegister'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Águilas del Sol ADS - Central de Monitoreo',
  description: 'Sistema de Botón de Pánico - Central de Monitoreo 24/7',
  manifest: '/manifest.json',
  applicationName: 'ADS Central',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ADS Central',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-background text-white antialiased`}>
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
