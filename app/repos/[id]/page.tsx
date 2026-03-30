'use client'

import { useEffect, useState, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, GitBranch, Settings, Trash2, Play, Pause, 
  Clock, CheckCircle, AlertTriangle, BarChart3, ExternalLink,
  Shield, Zap, Bot
} from 'lucide-react'
import Link from 'next/link'

interface RepoDetails {
  id: number
  name: string
  fullName: string
  githubId: string
  isActive: boolean
  autoMode: boolean
  webhookId: string | null
  createdAt: string
  github?: {
    description: string | null
    language: string | null
    stargazers_count: number
    forks_count: number
    private: boolean
    updated_at: string
  }
}

interface PipelineRun {
  id: number
  githubRunId: string
  status: 'failed' | 'pending_fix' | 'fixed' | 'analysis_failed'
  errorMessage: string | null
  fixApplied: string | null
  confidence: number | null
  createdAt: string
  aiExplanation?: string | null
  aiFixSuggestion?: string | null
  aiCodeFix?: string | null
}

interface RepoStats {
  totalRuns: number
  fixesApplied: number
  successRate: number
  avgFixTime: number
  timeSaved: number
}

export default function RepositoryDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter()
  const { id } = use(params)
  const [repo, setRepo] = useState<RepoDetails | null>(null)
  const [runs, setRuns] = useState<PipelineRun[]>([])
  const [stats, setStats] = useState<RepoStats>({
    totalRuns: 0,
    fixesApplied: 0,
    successRate: 0,
    avgFixTime: 0,
    timeSaved: 0
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRepoDetails()
  }, [id])

  const fetchRepoDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/repos/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard')
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setRepo(data.repo)
      setRuns(data.runs)
      setStats(data.stats)
    } catch (err) {
      console.error('Failed to fetch repository details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load repository')
    } finally {
      setLoading(false)
    }
  }

  const toggleAutoMode = async () => {
    if (!repo) return
    
    try {
      setUpdating(true)
      
      const response = await fetch(`/api/repos/${repo.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoMode: !repo.autoMode }),
      })

      if (!response.ok) {
        throw new Error('Failed to update auto-mode')
      }

      setRepo(prev => prev ? { ...prev, autoMode: !prev.autoMode } : null)
    } catch (err) {
      console.error('Failed to toggle auto-mode:', err)
      alert('Failed to update auto-mode setting')
    } finally {
      setUpdating(false)
    }
  }

  const toggleActiveStatus = async () => {
    if (!repo) return
    
    try {
      setUpdating(true)
      
      const response = await fetch(`/api/repos/${repo.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !repo.isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update active status')
      }

      setRepo(prev => prev ? { ...prev, isActive: !prev.isActive } : null)
    } catch (err) {
      console.error('Failed to toggle active status:', err)
      alert('Failed to update monitoring status')
    } finally {
      setUpdating(false)
    }
  }

  const deleteRepository = async () => {
    if (!repo || !confirm(`Are you sure you want to remove "${repo.name}" from monitoring?`)) {
      return
    }
    
    try {
      setDeleting(true)
      
      const response = await fetch(`/api/repos/${repo.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete repository')
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to delete repository:', err)
      alert('Failed to remove repository')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
      case 'analysis_failed':
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case 'pending_fix':
        return <Clock className="h-4 w-4 text-yellow-400" />
      default:
        return <GitBranch className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full"
    switch (status) {
      case 'fixed':
        return <span className={`${baseClasses} bg-green-400/20 text-green-400 border border-green-400/50`}>Fixed</span>
      case 'failed':
        return <span className={`${baseClasses} bg-red-400/20 text-red-400 border border-red-400/50`}>Failed</span>
      case 'pending_fix':
        return <span className={`${baseClasses} bg-yellow-400/20 text-yellow-400 border border-yellow-400/50`}>Pending Fix</span>
      case 'analysis_failed':
        return <span className={`${baseClasses} bg-gray-400/20 text-gray-400 border border-gray-400/50`}>Analysis Failed</span>
      default:
        return <span className={`${baseClasses} bg-gray-400/20 text-gray-400 border border-gray-400/50`}>Unknown</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 pt-24 pb-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    )
  }

  if (error || !repo) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 pt-24 pb-8">
          <Card className="bg-gray-900 border-red-700 max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">Repository Not Found</h3>
              <p className="text-gray-300 mb-4">{error || 'Repository details could not be loaded'}</p>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-blue-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 
                className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" 
                style={{ letterSpacing: '-0.02em' }}
              >
                {repo.name}
              </h1>
              <p className="text-gray-400 text-lg mb-4">{repo.fullName}</p>
              {repo.github?.description && (
                <p className="text-gray-300 max-w-2xl">{repo.github.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href={`https://github.com/${repo.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label={`View ${repo.name} on GitHub`}
                title={`View ${repo.name} on GitHub`}
              >
                <ExternalLink className="h-5 w-5" />
              </a>
              <div className={`w-3 h-3 rounded-full ${repo.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">Total Runs</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalRuns}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">Fixes Applied</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.fixesApplied}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{stats.successRate}%</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Time Saved</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{stats.timeSaved}h</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pipeline Runs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-blue-400" />
                    Recent Pipeline Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {runs.length === 0 ? (
                    <div className="text-center py-8">
                      <GitBranch className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No pipeline runs recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {runs.map((run) => (
                        <motion.div
                          key={run.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg"
                        >
                          {getStatusIcon(run.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(run.status)}
                              {run.confidence && (
                                <span className="text-xs text-gray-400">
                                  {run.confidence}% confidence
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 mb-1">
                              {run.errorMessage || 'No error message available'}
                            </p>
                            {run.fixApplied && (
                              <p className="text-xs text-green-400">
                                Fix applied: {run.fixApplied}
                              </p>
                            )}
                            {run.aiExplanation && (
                              <div className="mt-2 text-sm text-blue-300 bg-blue-900/20 p-2 rounded">
                                <span className="font-semibold text-blue-400">AI Analysis: </span>
                                {run.aiExplanation}
                              </div>
                            )}
                            {(run.aiFixSuggestion || run.aiCodeFix) && (
                              <div className="mt-2 bg-gray-900 rounded border border-gray-700 overflow-hidden">
                                <div className="bg-gray-800 px-3 py-1 text-xs font-mono text-gray-400 border-b border-gray-700">Recommended Fix</div>
                                <pre className="p-3 text-xs text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
                                  <code>
                                    {run.aiCodeFix || run.aiFixSuggestion}
                                  </code>
                                </pre>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(run.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Repository Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
                <CardHeader>
                  <CardTitle className="text-blue-400">Repository Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {repo.github && (
                    <>
                      {repo.github.language && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Language</span>
                          <span className="text-white">{repo.github.language}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stars</span>
                        <span className="text-white">⭐ {repo.github.stargazers_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Forks</span>
                        <span className="text-white">{repo.github.forks_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Visibility</span>
                        <span className={repo.github.private ? "text-yellow-400" : "text-green-400"}>
                          {repo.github.private ? "Private" : "Public"}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connected</span>
                    <span className="text-white">{new Date(repo.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Settings className="h-5 w-5" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Auto Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4 text-blue-400" />
                        <span className="font-medium text-white">Auto-Fix Mode</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Automatically apply AI-generated fixes
                      </p>
                    </div>
                    <button
                      onClick={toggleAutoMode}
                      disabled={updating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        repo.autoMode ? 'bg-green-400' : 'bg-gray-600'
                      }`}
                      aria-label={`Toggle auto-fix mode ${repo.autoMode ? 'off' : 'on'}`}
                      title={`Auto-fix mode is ${repo.autoMode ? 'enabled' : 'disabled'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          repo.autoMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Monitoring Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="font-medium text-white">Monitoring</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Enable pipeline monitoring
                      </p>
                    </div>
                    <button
                      onClick={toggleActiveStatus}
                      disabled={updating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        repo.isActive ? 'bg-blue-400' : 'bg-gray-600'
                      }`}
                      aria-label={`Toggle monitoring ${repo.isActive ? 'off' : 'on'}`}
                      title={`Monitoring is ${repo.isActive ? 'enabled' : 'disabled'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          repo.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Delete Repository */}
                  <div className="pt-4 border-t border-gray-700">
                    <Button
                      onClick={deleteRepository}
                      disabled={deleting}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleting ? 'Removing...' : 'Remove Repository'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
