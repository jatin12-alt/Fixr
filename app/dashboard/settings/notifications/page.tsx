'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Settings, TestTube, Send } from 'lucide-react'
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
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Configure how and when you receive notifications from Fixr.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Mail className="h-5 w-5 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-foreground">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-foreground font-medium">Pipeline Failures</p>
                <p className="text-sm text-muted-foreground">Get notified when a pipeline fails</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailOnFailure}
                onChange={(e) => updatePreferences({ emailOnFailure: e.target.checked })}
                className="w-4 h-4 text-muted-foreground bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-foreground font-medium">AI Fixes Applied</p>
                <p className="text-sm text-muted-foreground">Get notified when AI applies a fix</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailOnFix}
                onChange={(e) => updatePreferences({ emailOnFix: e.target.checked })}
                className="w-4 h-4 text-muted-foreground bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-foreground font-medium">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Summary of your pipeline health</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.weeklyDigest}
                onChange={(e) => updatePreferences({ weeklyDigest: e.target.checked })}
                className="w-4 h-4 text-muted-foreground bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-foreground">Push Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-foreground font-medium">Browser Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications in your browser even when Fixr is closed
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.pushEnabled}
                onChange={togglePushNotifications}
                className="w-4 h-4 text-muted-foreground bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
            </label>
          </div>
        </div>

        {/* Test Notifications */}
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TestTube className="h-5 w-5 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-foreground">Test Notifications</h2>
          </div>

          <p className="text-muted-foreground mb-4">
            Send a test notification to verify your settings are working correctly.
          </p>

          <div className="flex space-x-4">
            <button
              onClick={sendTestNotification}
              disabled={testLoading}
              className="flex items-center px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              {testLoading ? 'Sending...' : 'Send Test Notification'}
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Settings className="h-5 w-5 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-foreground">Current Status</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Unread Notifications</p>
              <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
            </div>
            <div className="bg-card rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Push Status</p>
              <p className="text-2xl font-bold text-foreground">
                {preferences.pushEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
