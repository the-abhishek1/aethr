import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Cursor from '@/components/ui/Cursor'
import Starfield from '@/components/ui/Starfield'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'Aethr — The Fifth Element, Inhabited',
  description: 'Not a platform. A living universe. Eight worlds. Infinite selves.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>
          <Cursor />
          <Starfield />
          <Nav />
          <main style={{ position: 'relative', zIndex: 10, flex: 1 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
