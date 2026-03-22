import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: 'operational' | 'degraded' | 'down'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    operational: {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      label: 'Operational',
      pulse: false,
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20',
      label: 'Degraded',
      pulse: true,
    },
    down: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/20',
      label: 'Down',
      pulse: true,
    },
  }

  const { icon: Icon, color, bgColor, label, pulse } = config[status]

  return (
    <div className={`flex items-center space-x-2 ${color}`}>
      <div className={`w-2 h-2 rounded-full ${bgColor} ${pulse ? 'animate-pulse' : ''}`}>
        <div className={`w-2 h-2 rounded-full ${bgColor} ${pulse ? 'animate-ping opacity-50' : ''}`} />
      </div>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
