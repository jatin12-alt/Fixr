'use client'

import { useEffect, useRef, useState } from 'react'
import { initLenis } from '@/lib/lenis'
import PageTransition from '@/components/PageTransition'
import { CustomCursor } from '@/components/CustomCursor'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const footerRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [footerHeight, setFooterHeight] = useState(400)

  useEffect(() => {
    // 1. Initialize Lenis
    const lenis = initLenis()

    // 2. Integration with GSAP ScrollTrigger
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update)

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
      })

      gsap.ticker.lagSmoothing(0)
    }

    // 3. Measure Footer height for padding fix
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        setFooterHeight(height)
        document.documentElement.style.setProperty('--footer-height', `${height}px`)
      }
    })

    const footer = document.querySelector('footer')
    if (footer) {
      observer.observe(footer)
    }

    return () => {
      lenis?.destroy()
      observer.disconnect()
      gsap.ticker.remove(() => {})
    }
  }, [])

  return (
    <div ref={wrapperRef} className="flex flex-col min-h-screen">
      <CustomCursor />
      <main className="flex-grow flex flex-col relative" style={{ paddingBottom: 'var(--footer-height, 400px)' }}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  )
}
