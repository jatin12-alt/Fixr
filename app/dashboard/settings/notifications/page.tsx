'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Settings, TestTube, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/providers/FirebaseAuthProvider'
import { useNotifications } from '@/hooks/useNotifications'
import { requestPermission, subscribeToPush, unsubscribeFromPush } from '@/lib/push-notifications'

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const userId = user?.uid
  const { unreadCount } = useNotifications()
  const [preferences, setPreferences] = useState({
    emailOnFailure: true,
    emailOnFix: true,
    weeklyDigest: false,
    pushEnabled: false,
  })
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    }
  }

  const updatePreferences = async (updates: Partial<typeof preferences>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...preferences, ...updates }),
      })

      if (response.ok) {
        setPreferences(prev => ({ ...prev, ...updates }))
      }
    } catch (error) {
      console.error('Failed to update preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePushNotifications = async () => {
    if (!userId) return
    
    if (preferences.pushEnabled) {
      await unsubscribeFromPush(userId)
      await updatePreferences({ pushEnabled: false })
    } else {
      try {
        const permission = await requestPermission()
        if (permission === 'granted') {
          await subscribeToPush(userId)
          await updatePreferences({ pushEnabled: true })
        }
      } catch (error) {
        console.error('Failed to enable push notifications:', error)
      }
    }
  }

  const sendTestNotification = async () => {
    if (!userId) return
    
    setTestLoading(true)
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      })
      
      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Failed to send test notification:', error)
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="max-w-[800px] mx-auto py-24 px-10 selection:bg-primary selection:text-black">
      <div className="mb-20">
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 block">System Configuration</span>
        <h1 className="text-4xl font-black text-white mb-6 tracking-tighter">Notification <span className="text-white/10 italic">Protocols.</span></h1>
        <p className="text-white/30 font-medium italic border-l-2 border-primary/20 pl-8">
          Configure architectural telemetry alerts and autonomous resolution summaries.
        </p>
      </div>

      <div className="space-y-12">
        {/* Email Notifications */}
        <div className="glass-card border-white/5 p-10 rounded-[32px] group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
          <div className="flex items-center mb-10">
            <Mail className="h-6 w-6 text-primary mr-4 shadow-glow" />
            <h2 className="text-xl font-black text-white tracking-tight">Signal Relay (Email)</h2>
          </div>

          <div className="space-y-8">
            <label className="flex items-center justify-between cursor-pointer group/item">
              <div>
                <p className="text-white/80 font-bold tracking-tight group-hover/item:text-white transition-colors">Pipeline Anomalies</p>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/20">Critical telemetry failure alerts</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailOnFailure}
                onChange={(e) => updatePreferences({ emailOnFailure: e.target.checked })}
                className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group/item">
              <div>
                <p className="text-white/80 font-bold tracking-tight group-hover/item:text-white transition-colors">Resolution Synthesis</p>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/20">Notifications on autonomous fixes</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailOnFix}
                onChange={(e) => updatePreferences({ emailOnFix: e.target.checked })}
                className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group/item">
              <div>
                <p className="text-white/80 font-bold tracking-tight group-hover/item:text-white transition-colors">Weekly Health Digest</p>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/20">Architectural performance summary</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.weeklyDigest}
                onChange={(e) => updatePreferences({ weeklyDigest: e.target.checked })}
                className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
              />
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="glass-card border-white/5 p-10 rounded-[32px] group relative overflow-hidden">
          <div className="flex items-center mb-10">
            <Bell className="h-6 w-6 text-primary mr-4 shadow-glow" />
            <h2 className="text-xl font-black text-white tracking-tight">Vessel Push (Browser)</h2>
          </div>

          <div className="space-y-8">
            <label className="flex items-center justify-between cursor-pointer group/item">
              <div>
                <p className="text-white/80 font-bold tracking-tight group-hover/item:text-white transition-colors">Direct Neural Link</p>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/20">
                  Receive high-velocity notifications in real-time
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.pushEnabled}
                onChange={togglePushNotifications}
                className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
              />
            </label>
          </div>
        </div>

        {/* Test Notifications */}
        <div className="glass-card border-white/5 p-10 rounded-[32px] group relative overflow-hidden">
          <div className="flex items-center mb-10">
            <TestTube className="h-6 w-6 text-primary mr-4 shadow-glow" />
            <h2 className="text-xl font-black text-white tracking-tight">Signal Validation</h2>
          </div>

          <p className="text-white/30 text-sm font-medium mb-10 italic border-l border-primary/20 pl-6">
            Initiate a test packet to verify telemetry link integrity across your hardware.
          </p>

          <div className="flex space-x-4">
            <button
              onClick={sendTestNotification}
              disabled={testLoading}
              className="flex items-center px-10 py-5 bg-primary text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-glow disabled:opacity-30 disabled:cursor-not-allowed group-btn"
            >
              <Send className="h-4 w-4 mr-3 group-btn-hover:translate-x-1 transition-transform" />
              {testLoading ? 'Relaying...' : 'Initiate Test Signal'}
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="glass-card border-white/5 p-10 rounded-[32px] group relative overflow-hidden">
          <div className="flex items-center mb-10">
            <Settings className="h-6 w-6 text-primary mr-4 shadow-glow" />
            <h2 className="text-xl font-black text-white tracking-tight">Telemetry State</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">Pending Buffer</p>
              <p className="text-4xl font-black text-white tracking-tighter">{unreadCount}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-8 border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">Pulse Status</p>
              <p className={cn(
                "text-4xl font-black tracking-tighter",
                preferences.pushEnabled ? "text-primary text-glow-subtle" : "text-white/10"
              )}>
                {preferences.pushEnabled ? 'ACTIVE' : 'IDLE'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
