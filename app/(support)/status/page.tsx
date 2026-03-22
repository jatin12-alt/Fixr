'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StatusBadge } from '@/components/support/StatusBadge'
import { RefreshCw, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: string
  lastChecked: string
}

interface SystemStatus {
  overall: 'operational' | 'degraded' | 'down'
  services: ServiceStatus[]
  incidents: {
    id: string
    title: string
    status: 'resolved' | 'investigating' | 'monitoring'
    date: string
    description: string
  }[]
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status')
      const data = await response.json()
      setStatus(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <RefreshCw className="h-8 w-8 text-cyan-400 mx-auto animate-spin" />
        <p className="text-gray-400 mt-4">Loading status...</p>
      </div>
    )
  }

  const overallStatus = status?.overall || 'operational'
  const overallConfig = {
    operational: {
      bg: 'bg-green-900/20',
      border: 'border-green-800',
      text: 'text-green-400',
      icon: CheckCircle,
      message: 'All Systems Operational',
    },
    degraded: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-800',
      text: 'text-yellow-400',
      icon: AlertTriangle,
      message: 'Some Systems Experiencing Issues',
    },
    down: {
      bg: 'bg-red-900/20',
      border: 'border-red-800',
      text: 'text-red-400',
      icon: AlertTriangle,
      message: 'System Outage Detected',
    },
  }

  const config = overallConfig[overallStatus]
  const Icon = config.icon

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">System Status</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Real-time status of Fixr services. Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Overall Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${config.bg} ${config.border} border rounded-2xl p-8 mb-8 text-center`}
      >
        <Icon className={`h-12 w-12 ${config.text} mx-auto mb-4`} />
        <h2 className={`text-2xl font-bold ${config.text} mb-2`}>
          {config.message}
        </h2>
        <p className="text-gray-400">
          All services are running normally. No incidents reported.
        </p>
      </motion.div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {status?.services.map((service, index) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{service.name}</h3>
              <StatusBadge status={service.status} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white font-medium">{service.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last checked</span>
                <span className="text-gray-500">{service.lastChecked}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Incidents */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Incidents</h2>
        
        {status?.incidents && status.incidents.length > 0 ? (
          <div className="space-y-4">
            {status.incidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{incident.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    incident.status === 'resolved'
                      ? 'bg-green-900/50 text-green-400'
                      : incident.status === 'investigating'
                      ? 'bg-yellow-900/50 text-yellow-400'
                      : 'bg-blue-900/50 text-blue-400'
                  }`}>
                    {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-400 mb-2">{incident.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(incident.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Recent Incidents</h3>
            <p className="text-gray-400">
              All systems have been running smoothly. No incidents reported in the last 30 days.
            </p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={fetchStatus}
          className="space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Status</span>
        </Button>
        <p className="text-gray-500 text-sm mt-2">
          Auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  )
}
