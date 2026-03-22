'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { X } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { 
  AlertCircle, 
  CheckCircle, 
  Bot, 
  Wrench, 
  Package 
} from 'lucide-react'

const iconMap = {
  PIPELINE_FAILED: AlertCircle,
  PIPELINE_RECOVERED: CheckCircle,
  AI_ANALYSIS_COMPLETE: Bot,
  AUTO_FIX_APPLIED: Wrench,
  REPO_CONNECTED: Package,
}

const colorMap = {
  PIPELINE_FAILED: 'bg-red-900/20 border-red-800 text-red-400',
  PIPELINE_RECOVERED: 'bg-green-900/20 border-green-800 text-green-400',
  AI_ANALYSIS_COMPLETE: 'bg-blue-900/20 border-blue-800 text-blue-400',
  AUTO_FIX_APPLIED: 'bg-cyan-900/20 border-cyan-800 text-cyan-400',
  REPO_CONNECTED: 'bg-purple-900/20 border-purple-800 text-purple-400',
}

interface ToastProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    repoName?: string
    repoId?: string
    createdAt: string
  }
  onDismiss: () => void
}

function Toast({ notification, onDismiss }: ToastProps) {
  const router = useRouter()
  const Icon = iconMap[notification.type as keyof typeof iconMap] || AlertCircle
  const colorClass = colorMap[notification.type as keyof typeof colorMap] || colorMap.PIPELINE_FAILED

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const handleClick = () => {
    if (notification.repoId) {
      router.push(`/dashboard/repos/${notification.repoId}`)
    }
    onDismiss()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className={`max-w-sm w-full p-4 rounded-lg border ${colorClass} cursor-pointer shadow-lg`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm">
            {notification.title}
          </p>
          <p className="text-sm opacity-90 mt-1">
            {notification.message}
          </p>
          <p className="text-xs opacity-75 mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

export function NotificationToast() {
  const { notifications } = useNotifications()
  const [visibleToasts, setVisibleToasts] = useState<string[]>([])

  // Show toast for new notifications
  useEffect(() => {
    const newNotifications = notifications.slice(0, 3).filter(n => !visibleToasts.includes(n.id))
    
    if (newNotifications.length > 0) {
      setVisibleToasts(prev => [...newNotifications.map(n => n.id), ...prev].slice(0, 3))
    }
  }, [notifications, visibleToasts])

  const handleDismiss = (notificationId: string) => {
    setVisibleToasts(prev => prev.filter(id => id !== notificationId))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {visibleToasts.map(id => {
          const notification = notifications.find(n => n.id === id)
          if (!notification) return null
          
          return (
            <Toast
              key={id}
              notification={notification}
              onDismiss={() => handleDismiss(id)}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}
