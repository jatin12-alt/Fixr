'use client'

import dynamic from 'next/dynamic'

const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => ({ default: mod.Analytics })),
  { ssr: false }
)

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => ({ default: mod.SpeedInsights })),
  { ssr: false }
)

export function AnalyticsWrapper() {
  if (process.env.NODE_ENV !== 'production') return null

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
