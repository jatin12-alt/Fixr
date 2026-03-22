'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GitBranch, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import type { DashboardData } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    repos: [],
    recentRuns: [],
    stats: { activeRepos: 0, fixesApplied: 0, timeSaved: 0, totalRuns: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
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
        return <span className={`${baseClasses} bg-yellow-400/20 text-yellow-400 border border-yellow-400/50`}>Pending</span>
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

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 pt-24 pb-8">
          <Card className="bg-gray-900 border-red-700 max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">Dashboard Error</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <Button onClick={fetchDashboardData} variant="outline">
                Retry
              </Button>
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
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}
            >
              CONTROL CENTER
            </h1>
            <p className="text-gray-400 text-lg">
              Monitor and manage your AI-powered pipeline automation
            </p>
          </div>
          <Link href="/repos">
            <Button variant="outline" size="lg">
              Add Repository
            </Button>
          </Link>
        </motion.div>
        
        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12"
        >
          <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Active Repos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{data.stats.activeRepos}</div>
              <p className="text-gray-400 text-sm">Repositories monitored</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Fixes Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{data.stats.fixesApplied}</div>
              <p className="text-gray-400 text-sm">Automatic fixes deployed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{data.stats.timeSaved}h</div>
              <p className="text-gray-400 text-sm">Developer time saved</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Total Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{data.stats.totalRuns}</div>
              <p className="text-gray-400 text-sm">Pipeline executions</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connected Repositories */}
        {data.repos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 text-blue-400">Connected Repositories</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.repos.map((repo) => (
                <Card 
                  key={repo.id} 
                  className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors cursor-pointer"
                  onClick={() => router.push(`/repos/${repo.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{repo.name}</h3>
                        <p className="text-sm text-gray-400">{repo.fullName}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${repo.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded ${
                        repo.autoMode ? 'bg-green-400/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        Auto: {repo.autoMode ? 'ON' : 'OFF'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(repo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Pipeline Runs */}
        {data.recentRuns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
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
        )}

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
    </div>
  )
}
