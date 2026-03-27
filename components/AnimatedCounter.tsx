'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedCounterProps {
  value: number | string
  duration?: number
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ 
  value, 
  duration = 1.5, 
  prefix = '', 
  suffix = '' 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
    
    if (numericValue === 0) {
      setDisplayValue(0)
      return
    }

    setIsAnimating(true)
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (numericValue - startValue) * easeOutQuart
      
      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <AnimatePresence>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className={isAnimating ? 'text-cyan-400' : ''}
      >
        {prefix}{displayValue.toLocaleString()}{suffix}
      </motion.span>
    </AnimatePresence>
  )
}
