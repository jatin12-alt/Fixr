'use client'

import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import { 
  AlertCircle, 
  CheckCircle, 
  Bot, 
  Wrench, 
  Package,
  ExternalLink 
} from 'lucide-react'

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    repoName?: string
    repoId?: string
    read: boolean
    createdAt: string
  }
  onItemClick: () => void
}

const iconMap = {
  PIPELINE_FAILED: AlertCircle,
  PIPELINE_RECOVERED: CheckCircle,
  AI_ANALYSIS_COMPLETE: Bot,
  AUTO_FIX_APPLIED: Wrench,
  REPO_CONNECTED: Package,
}

const colorMap = {
  PIPELINE_FAILED: 'text-red-400',
  PIPELINE_RECOVERED: 'text-green-400',
  AI_ANALYSIS_COMPLETE: 'text-blue-400',
  AUTO_FIX_APPLIED: 'text-cyan-400',
  REPO_CONNECTED: 'text-purple-400',
}

export function NotificationItem({ notification, onItemClick }: NotificationItemProps) {
  const { markAsRead } = useNotifications()
  const router = useRouter()
  const Icon = iconMap[notification.type as keyof typeof iconMap] || AlertCircle
  const iconColor = colorMap[notification.type as keyof typeof colorMap] || 'text-gray-400'

  const handleClick = () => {
    if (!notification.read) {
      markAsRead([notification.id])
    }

    // Navigate to relevant page
    if (notification.repoId) {
      router.push(`/dashboard/repos/${notification.repoId}`)
    } else if (notification.type === 'REPO_CONNECTED') {
      router.push('/dashboard')
    }

    onItemClick()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`p-4 border-b border-gray-800 cursor-pointer transition-colors ${
        !notification.read 
          ? 'bg-gray-800/50 hover:bg-gray-800' 
          : 'hover:bg-gray-900/50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                !notification.read ? 'text-white' : 'text-gray-300'
              }`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {notification.message}
              </p>
              {notification.repoName && (
                <p className="text-xs text-gray-500 mt-1">
                  {notification.repoName}
                </p>
              )}
            </div>
            
            {!notification.read && (
              <div className="ml-2">
                <div className="h-2 w-2 bg-cyan-400 rounded-full" />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            
            <ExternalLink className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
