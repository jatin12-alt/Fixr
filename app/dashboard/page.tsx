'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GitBranch, Clock, CheckCircle, AlertTriangle, Plus, Github, Loader2, BarChart3, Zap } from 'lucide-react'
import type { DashboardData } from '@/types'
import RepoManagementModal from '@/components/RepoManagementModal'

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    repos: [],
    recentRuns: [],
    stats: { activeRepos: 0, fixesApplied: 0, timeSaved: 0, totalRuns: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Dashboard error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Empty state - no repos connected
  if (data.repos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-8">
              <Github className="w-24 h-24 text-gray-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4">Welcome to Fixr</h1>
              <p className="text-xl text-gray-400 mb-8">
                Connect your GitHub repositories to start monitoring and fixing CI/CD pipeline failures with AI
              </p>
            </div>

            <Card className="bg-gray-900 border-gray-800 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                    <div>
                      <h3 className="font-semibold">Connect GitHub</h3>
                      <p className="text-gray-400 text-sm">Authorize Fixr to access your repositories</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                    <div>
                      <h3 className="font-semibold">Add Repositories</h3>
                      <p className="text-gray-400 text-sm">Select which repositories to monitor</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                    <div>
                      <h3 className="font-semibold">Set Up Webhooks</h3>
                      <p className="text-gray-400 text-sm">Enable automatic pipeline monitoring</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href="/repos">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-5 h-5 mr-2" />
                      Connect Your First Repository
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'fixed':
        return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      fixed: 'bg-green-500/10 text-green-400 border-green-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
      running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  // Dashboard with repos
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Monitor your CI/CD pipeline health and AI fixes</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Repos</p>
                    <p className="text-3xl font-bold">{data.stats.activeRepos}</p>
                  </div>
                  <GitBranch className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Fixes Applied</p>
                    <p className="text-3xl font-bold">{data.stats.fixesApplied}</p>
                  </div>
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Time Saved</p>
                    <p className="text-3xl font-bold">{data.stats.timeSaved}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Runs</p>
                    <p className="text-3xl font-bold">{data.stats.totalRuns}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Repositories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <GitBranch className="w-5 h-5 mr-2" />
                    Your Repositories
                  </CardTitle>
                  <Link href="/repos">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.repos.slice(0, 5).map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedRepoId(repo.id)
                        setIsModalOpen(true)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <GitBranch className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-semibold">{repo.name}</p>
                          <p className="text-sm text-gray-400">{repo.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${repo.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className="text-sm text-gray-400">
                          {repo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Pipeline Runs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Recent Pipeline Activity</h2>
            <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {data.recentRuns.map((run) => (
                    <div key={run.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded">
                      {getStatusIcon(run.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{run.repo?.name}</span>
                          {getStatusBadge(run.status)}
                          {run.confidence && (
                            <span className="text-xs text-gray-400">({run.confidence}% confidence)</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-1">{run.errorMessage}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(run.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Empty State */}
        {data.repos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors text-center p-12">
              <CardContent>
                <GitBranch className="h-16 w-16 text-gray-500 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-300 mb-4">No Repositories Connected</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Connect your GitHub repositories to start monitoring your CI/CD pipelines with AI-powered analysis.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left max-w-md mx-auto">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">1</div>
                    <span className="text-gray-300">Connect your GitHub account</span>
                  </div>
                  <div className="flex items-center gap-3 text-left max-w-md mx-auto">
                    <div className="w-8 h-8 bg-gray-600/20 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">2</div>
                    <span className="text-gray-300">Select repositories to monitor</span>
                  </div>
                  <div className="flex items-center gap-3 text-left max-w-md mx-auto">
                    <div className="w-8 h-8 bg-gray-600/20 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">3</div>
                    <span className="text-gray-300">Enable auto-fix mode</span>
                  </div>
                </div>
                <Link href="/repos">
                  <Button variant="outline" size="lg" className="mt-8">
                    Connect GitHub Repository
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Repo Management Modal */}
      <RepoManagementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRepoId(null)
        }}
        repoId={selectedRepoId}
      />
    </div>
  )
}
