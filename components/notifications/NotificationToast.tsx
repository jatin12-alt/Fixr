'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { X, AlertCircle, CheckCircle, Bot, Wrench, Package } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

const iconMap = {
  PIPELINE_FAILED: AlertCircle,
  PIPELINE_RECOVERED: CheckCircle,
  AI_ANALYSIS_COMPLETE: Bot,
  AUTO_FIX_APPLIED: Wrench,
  REPO_CONNECTED: Package,
}

const colorMap = {
  PIPELINE_FAILED: 'bg-red-950/40 border-red-800/50 text-red-400',
  PIPELINE_RECOVERED: 'bg-green-950/40 border-green-800/50 text-green-400',
  AI_ANALYSIS_COMPLETE: 'bg-blue-950/40 border-blue-800/50 text-blue-400',
  AUTO_FIX_APPLIED: 'bg-cyan-950/40 border-cyan-800/50 text-cyan-400',
  REPO_CONNECTED: 'bg-purple-950/40 border-purple-800/50 text-purple-400',
}

export function NotificationToast() {
  const { notifications, dismissNotification } = useNotifications()
  const router = useRouter()
  
  // Requirement: Max 1 notification visible at a time
  const currentNotification = notifications.length > 0 ? notifications[0] : null

  // Requirement: Auto-dismiss after 3 seconds
  useEffect(() => {
    if (currentNotification) {
      const timer = setTimeout(() => {
        dismissNotification(currentNotification.id)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentNotification, dismissNotification])

  if (!currentNotification) return null

  const Icon = iconMap[currentNotification.type as keyof typeof iconMap] || AlertCircle
  const colorClass = colorMap[currentNotification.type as keyof typeof colorMap] || colorMap.PIPELINE_FAILED

  const handleToastClick = () => {
    if (currentNotification.repoId) {
      router.push(`/dashboard/repos/${currentNotification.repoId}`)
    }
    dismissNotification(currentNotification.id)
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-[60] pointer-events-none" 
      id="notification-toast-container"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNotification.id}
          initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } }}
          className={`pointer-events-auto max-w-sm w-full p-4 rounded-xl border backdrop-blur-md shadow-2xl cursor-pointer ${colorClass} transition-shadow hover:shadow-cyan-500/10`}
          onClick={handleToastClick}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-white tracking-tight mb-0.5 truncate">
                {currentNotification.title}
              </h4>
              <p className="text-xs text-white/70 leading-relaxed line-clamp-2 mb-2">
                {currentNotification.message}
              </p>
              <span className="text-[10px] font-medium opacity-50 uppercase tracking-widest">
                {formatDistanceToNow(new Date(currentNotification.createdAt), { addSuffix: true })}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                dismissNotification(currentNotification.id)
              }}
              className="p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
