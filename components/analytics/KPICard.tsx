'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  trend?: number
  trendDirection?: 'up' | 'down'
  icon?: React.ReactNode
  loading?: boolean
}

export function KPICard({ 
  title, 
  value, 
  unit = '', 
  trend, 
  trendDirection, 
  icon, 
  loading 
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0

  // Animated count-up effect
  useEffect(() => {
    if (loading) return

    const duration = 2000
    const steps = 60
    const stepValue = numericValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [numericValue, loading])

  if (loading) {
    return (
      <div className="glass-card border-white/5 p-8 rounded-[24px] animate-pulse">
        <div className="h-4 bg-white/5 rounded w-3/4 mb-6"></div>
        <div className="h-10 bg-white/5 rounded w-1/2 mb-2"></div>
      </div>
    )
  }

  const formatValue = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
    if (Number.isInteger(val)) return val.toString()
    return val.toFixed(1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-white/5 p-8 rounded-[24px] group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-primary transition-colors">{title}</h3>
        {icon && <div className="text-primary shadow-glow">{icon}</div>}
      </div>
      
      <div className="flex items-baseline mb-2">
        <span className="text-4xl font-black text-white tracking-tighter group-hover:text-glow-subtle transition-all duration-500">
          {formatValue(displayValue)}
        </span>
        {unit && (
          <span className="ml-2 text-[11px] font-black uppercase tracking-widest text-white/10">{unit}</span>
        )}
      </div>

      {trend !== undefined && trendDirection && (
        <div className="flex items-center mt-6">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            trendDirection === 'up' ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
          )}>
            {trendDirection === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </div>
          <span className="ml-3 text-[9px] font-black uppercase tracking-widest text-white/20">vs cycle</span>
        </div>
      )}
    </motion.div>
  )
}
