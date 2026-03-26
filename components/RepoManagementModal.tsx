'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Settings, RefreshCw, Trash2, Shield, AlertTriangle, 
  CheckCircle, Clock, Zap, Bot, ExternalLink, GitBranch, BarChart3
} from 'lucide-react'

interface RepoDetails {
  id: number
  name: string
  fullName: string
  isActive: boolean
  autoFixEnabled: boolean
  healthStatus: 'healthy' | 'failed' | 'pending'
  lastScanAt: string | null
  createdAt: string
  webhookId: string | null
  github?: {
    description: string | null
    stars: number
    language: string | null
    lastPush: string
  }
}

interface PipelineRun {
  id: number
  status: string
  errorMessage: string | null
  fixApplied: string | null
  confidence: number | null
  createdAt: string
  aiExplanation: string | null
  aiFixSuggestion: string | null
  aiCodeFix: string | null
  aiSeverity: string | null
  aiCategory: string | null
  aiConfidence: number | null
}

interface RepoStats {
  totalRuns: number
  fixesApplied: number
  successRate: number
  timeSaved: number
}

interface RepoManagementModalProps {
  isOpen: boolean
  onClose: () => void
  repoId: number | null
}

export default function RepoManagementModal({ isOpen, onClose, repoId }: RepoManagementModalProps) {
  const [repo, setRepo] = useState<RepoDetails | null>(null)
  const [stats, setStats] = useState<RepoStats | null>(null)
  const [recentRuns, setRecentRuns] = useState<PipelineRun[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && repoId) {
      fetchRepoDetails()
    }
  }, [isOpen, repoId])

  const fetchRepoDetails = async () => {
    if (!repoId) return
    
    console.log("🔍 FETCHING_REPO_DETAILS for Repo ID:", repoId)
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/repos/${repoId}`)
      console.log("📡 API_RESPONSE_STATUS:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log("❌ API_ERROR:", errorText)
        throw new Error(`Failed to fetch repo details: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("✅ API_SUCCESS:", { 
        repoId: data.repo?.id, 
        repoName: data.repo?.name,
        hasStats: !!data.stats,
        runsCount: data.recentRuns?.length 
      })
      
      setRepo(data.repo)
      setStats(data.stats)
      setRecentRuns(data.recentRuns)
    } catch (err) {
      console.error("❌ FETCH_ERROR:", err)
      setError(err instanceof Error ? err.message : 'Failed to load repository details')
    } finally {
      setLoading(false)
    }
  }

  const updateRepoSettings = async (updates: Partial<RepoDetails>) => {
    if (!repoId) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/repos/${repoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update settings')
      
      const data = await response.json()
      setRepo(data.repo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setUpdating(false)
    }
  }

  const refreshScan = async () => {
    if (!repoId) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/repos/${repoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshScan: true })
      })
      
      if (!response.ok) throw new Error('Failed to refresh scan')
      
      await fetchRepoDetails() // Refresh data
    } finally {
      setUpdating(false)
    }
  }

  const deleteRepo = async () => {
    if (!repoId || !repo) return
    
    if (!confirm(`Are you sure you want to stop monitoring ${repo.fullName}? This will remove the webhook and delete all history.`)) {
      return
    }
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/repos/${repoId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete repository')
      
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete repository')
    } finally {
      setUpdating(false)
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-50 border-green-200'
      case 'failed': return 'text-red-500 bg-red-50 border-red-200'
      case 'pending': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <AlertTriangle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GitBranch className="w-6 h-6 text-blue-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {repo?.fullName || 'Loading...'}
                  </h2>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getHealthStatusColor(repo?.healthStatus || 'pending')}`}>
                    {getHealthStatusIcon(repo?.healthStatus || 'pending')}
                    <span className="capitalize">{repo?.healthStatus || 'pending'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-gray-500 text-sm">Loading repository details...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : repo ? (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Auto-Fix Toggle */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900">Auto-Fix</p>
                            <p className="text-sm text-gray-500">Automatically apply AI fixes</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateRepoSettings({ autoFixEnabled: !repo.autoFixEnabled })}
                          disabled={updating}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            repo.autoFixEnabled ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              repo.autoFixEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Refresh Scan */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">Refresh Scan</p>
                            <p className="text-sm text-gray-500">
                              Last scan: {repo.lastScanAt ? new Date(repo.lastScanAt).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={refreshScan}
                          disabled={updating}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {updating ? 'Scanning...' : 'Scan'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {stats && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.totalRuns}</p>
                        <p className="text-sm text-gray-600">Total Runs</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.fixesApplied}</p>
                        <p className="text-sm text-gray-600">Fixes Applied</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.successRate}%</p>
                        <p className="text-sm text-gray-600">Success Rate</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.timeSaved}h</p>
                        <p className="text-sm text-gray-600">Time Saved</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Events */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Events (Last 5)
                  </h3>
                  <div className="space-y-2">
                    {recentRuns.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No events recorded yet</p>
                    ) : (
                      recentRuns.map((run) => (
                        <div key={run.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              run.status === 'fixed' ? 'bg-green-500' :
                              run.status === 'failed' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900">
                                {run.status === 'fixed' ? 'Build Fixed' :
                                 run.status === 'failed' ? 'Build Failed' :
                                 'Analysis Complete'}
                              </p>
                              {run.errorMessage && (
                                <p className="text-sm text-gray-500">{run.errorMessage}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {new Date(run.createdAt).toLocaleDateString()}
                            </p>
                            {run.confidence && (
                              <p className="text-xs text-gray-500">{run.confidence}% confidence</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Danger Zone
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Delete Monitoring</p>
                        <p className="text-sm text-red-700">
                          Remove webhook and delete all monitoring data for {repo.fullName}
                        </p>
                      </div>
                      <button
                        onClick={deleteRepo}
                        disabled={updating}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
