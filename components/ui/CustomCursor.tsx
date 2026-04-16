'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Start offscreen so they don't flash at 0,0
    gsap.set([dot, ring], { x: -100, y: -100 })

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      // Dot: instant
      gsap.set(dot, { 
        x: mouseX - 4,  // offset by half of dot size (8px / 2)
        y: mouseY - 4 
      })
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      gsap.set(ring, { 
        x: ringX - 16,  // offset by half of ring size (32px / 2)
        y: ringY - 16 
      })
      rafId = requestAnimationFrame(animateRing)
    }

    window.addEventListener('mousemove', onMouseMove)
    rafId = requestAnimationFrame(animateRing)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-[99999]">
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white mix-blend-difference will-change-transform"
      />
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-[1.5px] border-white mix-blend-difference opacity-50 will-change-transform"
      />
    </div>
  )
}
