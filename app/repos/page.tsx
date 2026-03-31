'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Github, Star, Lock, Globe, Search, 
         CheckCircle, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/providers/FirebaseAuthProvider'

interface GitHubRepo {
  id: number
  name: string
  fullName: string
  description: string | null
  url: string
  private: boolean
  language: string | null
  stars: number
  updatedAt: string
}

interface MonitoredRepo {
  githubRepoId: string
}

export default function ReposPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [connected, setConnected] = useState<boolean | null>(null)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [monitoredRepos, setMonitoredRepos] = useState<MonitoredRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      checkGitHubStatus()
    }
  }, [user])

  async function checkGitHubStatus() {
    if (!user) return

    try {
      console.log('Repos page: Checking GitHub status...')
      const idToken = await user.getIdToken()
      
      // Check if GitHub is connected
      const statusRes = await fetch('/api/auth/github/status', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      
      if (!statusRes.ok) {
        throw new Error(`Status API failed: ${statusRes.status}`)
      }
      
      const status = await statusRes.json()
      setConnected(status.connected)

      if (status.connected) {
        // Fetch GitHub repos and monitored repos in parallel
        const [githubRes, monitoredRes] = await Promise.all([
          fetch('/api/github/repos', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          }),
          fetch('/api/repos', {
            headers: { 'Authorization': `Bearer ${idToken}` }
          }),
        ])
        
        if (githubRes.ok) {
          const githubData = await githubRes.json()
          if (githubData.repos) setGithubRepos(githubData.repos)
        }
        
        if (monitoredRes.ok) {
          const monitoredData = await monitoredRes.json()
          if (monitoredData.repos) setMonitoredRepos(monitoredData.repos)
        }
      }
    } catch (err) {
      console.error('Repos page: checkGitHubStatus error:', err)
      setError(`Failed to load: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  async function addRepo(repo: GitHubRepo) {
    if (!user) return
    setAdding(repo.id)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          githubRepoId: String(repo.id),
          name: repo.name,
          fullName: repo.fullName,
          url: repo.url,
          language: repo.language,
          private: repo.private,
        }),
      })
      if (res.ok) {
        setMonitoredRepos(prev => [
          ...prev,
          { githubRepoId: String(repo.id) }
        ])
      }
    } catch (err) {
      console.error('Failed to add repo:', err)
    } finally {
      setAdding(null)
    }
  }

  const filteredRepos = githubRepos.filter(repo =>
    repo.fullName.toLowerCase().includes(search.toLowerCase())
  )

  const isMonitored = (repoId: number) =>
    monitoredRepos.some(r => r.githubRepoId === String(repoId))

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-gray-400">Loading your repositories...</p>
        </div>
      </div>
    )
  }

  // NOT CONNECTED STATE
  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Github className="w-10 h-10 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Connect GitHub
          </h1>
          <p className="text-gray-400 mb-8">
            Connect your GitHub account to start monitoring 
            your CI/CD pipelines with AI.
          </p>
          
          <Link 
            href="/api/auth/github"
            className="inline-flex items-center gap-3 bg-white text-black 
                       font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 
                       transition-colors"
          >
            <Github className="w-5 h-5" />
            Connect with GitHub
          </Link>
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </motion.div>
      </div>
    )
  }

  // CONNECTED - SHOW REPOS
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Your Repositories
            </h1>
            <p className="text-gray-400 mt-1">
              {githubRepos.length} repos found · 
              {monitoredRepos.length} monitored
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 
                             w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl 
                       pl-10 pr-4 py-3 text-white placeholder-gray-500 
                       focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Repo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo, i) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 
                         hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {repo.private ? (
                    <Lock className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-green-400" />
                  )}
                  <Link
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium hover:text-blue-400 
                               transition-colors truncate max-w-[160px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {repo.name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Star className="w-3 h-3" />
                    {repo.stars}
                  </div>
                </div>
              </div>

              {repo.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {repo.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                {repo.language && (
                  <span className="text-xs text-gray-500 bg-gray-800 
                                   px-2 py-1 rounded-full">
                    {repo.language}
                  </span>
                )}
                
                {isMonitored(repo.id) ? (
                  <span className="flex items-center gap-1 text-green-400 
                                   text-sm font-medium ml-auto">
                    <CheckCircle className="w-4 h-4" />
                    Monitoring
                  </span>
                ) : (
                  <button
                    onClick={() => addRepo(repo)}
                    disabled={adding === repo.id}
                    className="ml-auto flex items-center gap-1 bg-blue-600 
                               hover:bg-blue-500 disabled:opacity-50 text-white 
                               text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {adding === repo.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    Monitor
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No repositories found matching "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
