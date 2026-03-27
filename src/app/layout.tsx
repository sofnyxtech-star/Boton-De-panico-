import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Águilas del Sol ADS - Central de Monitoreo',
  description: 'Sistema de Botón de Pánico - Central de Monitoreo 24/7',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-background text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
