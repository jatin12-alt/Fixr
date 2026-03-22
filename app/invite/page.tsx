'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'

interface InviteData {
  team: {
    id: string
    name: string
    slug: string
  }
  role: string
  email: string
}

export default function InvitePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      fetchInvite()
    } else {
      setError('Invalid invite link')
      setLoading(false)
    }
  }, [token])

  const fetchInvite = async () => {
    try {
      const response = await fetch(`/api/invite/${token}`)
      if (response.ok) {
        const data = await response.json()
        setInviteData(data)
      } else {
        const error = await response.json()
        setError(error.error || 'Invalid or expired invite')
      }
    } catch (error) {
      console.error('Failed to fetch invite:', error)
      setError('Failed to load invite')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    if (!token) return

    setAccepting(true)
    try {
      const response = await fetch(`/api/invite/${token}`, {
        method: 'POST',
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const error = await response.json()
        setError(error.error || 'Failed to accept invite')
      }
    } catch (error) {
      console.error('Failed to accept invite:', error)
      setError('Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Owner'
      case 'ADMIN': return 'Admin'
      case 'MEMBER': return 'Member'
      case 'VIEWER': return 'Viewer'
      default: return role
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Full control over team and all resources'
      case 'ADMIN': return 'Can manage members, repositories, and view analytics'
      case 'MEMBER': return 'Can manage repositories and view analytics'
      case 'VIEWER': return 'Read-only access to team analytics and repositories'
      default: return 'Team member'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to the Team!</h1>
          <p className="text-gray-400 mb-6">
            You've successfully joined {inviteData?.team.name}
          </p>
          <a
            href={`/dashboard/teams/${inviteData?.team.id}`}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Go to Team
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 border border-gray-800 rounded-xl p-8"
        >
          {/* Team Info */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              You're invited to join
            </h1>
            <h2 className="text-xl font-semibold text-cyan-400 mb-1">
              {inviteData?.team.name}
            </h2>
            <p className="text-gray-400 text-sm">
              /{inviteData?.team.slug}
            </p>
          </div>

          {/* Role Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Your Role</span>
              <span className="px-2 py-1 text-xs font-medium text-white bg-cyan-500 rounded">
                {getRoleLabel(inviteData?.role || '')}
              </span>
            </div>
            <p className="text-sm text-gray-300">
              {getRoleDescription(inviteData?.role || '')}
            </p>
          </div>

          {/* Invite Details */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{inviteData?.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Invited by</span>
              <span className="text-white">Team Admin</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-yellow-400" />
                <span className="text-yellow-400">Pending</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {accepting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Accepting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Accept Invitation</span>
                </>
              )}
            </button>
            
            <a
              href="/dashboard"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>Decline</span>
            </a>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              By accepting this invitation, you'll be added to the team and gain access to team resources.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
