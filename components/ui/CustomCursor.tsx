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
    <>
      <div 
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          backgroundColor: '#fff',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      <div 
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1.5px solid #fff',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        @media (max-width: 768px) {
          * {
            cursor: auto !important;
          }
          .fixed {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
