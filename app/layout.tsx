import { ClientAuthProvider } from '@/components/providers/ClientAuthProvider'
import { ThemeProvider } from 'next-themes'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorProvider } from '@/lib/providers/ErrorProvider'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { NotificationToast } from '@/components/notifications/NotificationToast'
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper'
import './globals.css'
import './layout.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://fixr.vercel.app'),
  title: {
    default: 'Fixr — AI-Powered CI/CD Pipeline Monitor',
    template: '%s | Fixr'
  },
  description: 'Pure DevOps automation with AI. Fixr monitors, analyzes, and automatically resolves pipeline failures.',
  keywords: ['CI/CD', 'DevOps', 'GitHub Actions', 'AI DevOps', 'automation'],
  authors: [{ name: 'Fixr' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body
        className={`${inter.variable} font-sans bg-[#131317] text-[#e5e1e7] min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClientAuthProvider>
            <CustomCursor />
            <Navbar />
            
            <ErrorProvider>
              <ErrorBoundary>
                <LayoutWrapper>
                  <NotificationToast />
                  {children}
                </LayoutWrapper>
                <Footer />
              </ErrorBoundary>
            </ErrorProvider>
          </ClientAuthProvider>
        </ThemeProvider>

        <AnalyticsWrapper />
      </body>
    </html>
  )
}
