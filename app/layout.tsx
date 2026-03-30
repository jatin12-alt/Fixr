import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from 'next-themes'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorProvider } from '@/lib/providers/ErrorProvider'
import { Footer } from '@/components/Footer'
import { Navigation } from '@/components/Navigation'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationToast } from '@/components/notifications/NotificationToast'
import { ParticleBackground } from '@/components/ParticleBackground'
import { validateEnvironment } from '@/lib/config/security'
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper'
import './globals.css'
import './layout.css'
import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'

// Validate environment on startup
// validateEnvironment() // Temporarily commented out for debugging

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', weight: ['400', '700', '900'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fixr.vercel.app'),
  title: {
    default: 'Fixr — AI-Powered CI/CD Pipeline Monitor',
    template: '%s | Fixr'
  },
  description: 'Fixr monitors your CI/CD pipelines with AI. Auto-detects failures, analyzes root causes, and applies fixes automatically.',
  keywords: ['CI/CD', 'DevOps', 'GitHub Actions', 'pipeline monitoring', 'AI DevOps', 'auto fix', 'continuous integration', 'continuous deployment'],
  authors: [{ name: 'Fixr' }],
  creator: 'Fixr',
  publisher: 'Fixr',
  category: 'technology',
  classification: 'Developer Tools',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://fixr.vercel.app',
    siteName: 'Fixr',
    title: 'Fixr — AI-Powered CI/CD Pipeline Monitor',
    description: 'Auto-fix CI/CD failures with AI. Monitor, analyze, and fix your pipelines automatically.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Fixr Dashboard - AI-Powered CI/CD Pipeline Monitor'
    }]
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Fixr — AI-Powered CI/CD Pipeline Monitor',
    description: 'Auto-fix CI/CD failures with AI. Monitor, analyze, and fix your pipelines automatically.',
    images: ['/og-image.png'],
    creator: '@fixrapp',
    site: '@fixrapp'
  },
  
  // App metadata
  applicationName: 'Fixr',
  appleWebApp: {
    capable: true,
    title: 'Fixr',
    statusBarStyle: 'default'
  },
  
  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' }
    ],
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  
  // Manifest
  manifest: '/site.webmanifest'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${orbitron.variable} font-sans text-white min-h-screen flex flex-col layout-body`}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* Particle canvas — fixed behind everything, visible on all pages */}
          <div className="particle-container">
            <ParticleBackground />
          </div>

          <Navigation />

          {/* Subtle ambient glow blobs */}
          <div className="ambient-glow-top-left" />
          <div className="ambient-glow-bottom-right" />

          <ErrorProvider>
            <ErrorBoundary>
              <main className="flex-grow main-content">
                <NotificationBell />
                <NotificationToast />
                {children}
              </main>
              <div className="footer-container">
                <Footer />
              </div>
            </ErrorBoundary>
          </ErrorProvider>
          </ThemeProvider>
          
          {/* Analytics - with error handling */}
          <AnalyticsWrapper />
        </body>
      </html>
    </ClerkProvider>
  )
}
