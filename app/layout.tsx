import { ClientAuthProvider } from '@/components/providers/ClientAuthProvider'
import { ThemeProvider } from 'next-themes'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorProvider } from '@/lib/providers/ErrorProvider'
import { Footer } from '@/components/Footer'
import { Navigation } from '@/components/Navigation'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationToast } from '@/components/notifications/NotificationToast'
import { ParticleBackground } from '@/components/ParticleBackground'
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper'
import './globals.css'
import './layout.css'
import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'

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
  
  twitter: {
    card: 'summary_large_image',
    title: 'Fixr — AI-Powered CI/CD Pipeline Monitor',
    description: 'Auto-fix CI/CD failures with AI. Monitor, analyze, and fix your pipelines automatically.',
    images: ['/og-image.png'],
    creator: '@fixrapp',
    site: '@fixrapp'
  },
  
  applicationName: 'Fixr',
  appleWebApp: {
    capable: true,
    title: 'Fixr',
    statusBarStyle: 'default'
  },
  
  manifest: '/site.webmanifest'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientAuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${orbitron.variable} font-sans text-white min-h-screen flex flex-col layout-body`}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="particle-container">
            <ParticleBackground />
          </div>

          <Navigation />

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
          
          <AnalyticsWrapper />
        </body>
      </html>
    </ClientAuthProvider>
  )
}
