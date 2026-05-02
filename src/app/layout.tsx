import type { Metadata, Viewport } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import MobileTabBar from '@/components/layout/MobileTabBar'
import Cursor from '@/components/ui/Cursor'
import Starfield from '@/components/ui/Starfield'
import PWAInstaller from '@/components/ui/PWAInstaller'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'Aethr — The Fifth Element, Inhabited',
  description: 'Not a platform. A living universe. Eight worlds. Infinite selves.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aethr',
  },
  openGraph: {
    title: 'Aethr — The Fifth Element, Inhabited',
    description: 'Not a platform. A living universe. Eight worlds. Infinite selves.',
    type: 'website',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#04040a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aethr" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <PWAInstaller />
          <Cursor />
          <Starfield />
          <Nav />
          <main style={{ position: 'relative', zIndex: 10, flex: 1 }}>
            {children}
          </main>
          <Footer />
          <MobileTabBar />
        </AuthProvider>
      </body>
    </html>
  )
}
