'use client'

import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

export const MagneticButton = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const btnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const btn = btnRef.current
    if (!btn) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) * 0.35
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35
      
      gsap.to(btn, {
        x,
        y,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      })
    }

    btn.addEventListener('mousemove', handleMouseMove)
    btn.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove)
      btn.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div ref={btnRef} className={`inline-block ${className}`}>
      {children}
    </div>
  )
}
