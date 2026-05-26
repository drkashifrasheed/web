import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'Dr Mahar Kashif Rasheed - Premium Healthcare & Telemedicine',
  description: 'Book appointments with Dr Mahar Kashif Rasheed. Premium healthcare services with video consultations, chat support, and expert medical care.',
  keywords: ['healthcare', 'doctor', 'telemedicine', 'appointments', 'medical', 'Dr Mahar Kashif Rasheed'],
  authors: [{ name: 'Dr Mahar Kashif Rasheed' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Dr Mahar Kashif Rasheed - Premium Healthcare',
    description: 'Book appointments with Dr Mahar Kashif Rasheed. Premium healthcare services.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            containerClassName="!top-[calc(4rem+env(safe-area-inset-top))] sm:!top-4"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: 'white',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'white',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
