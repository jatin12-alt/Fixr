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
  const { user, loading: authLoading } = useAuth()
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
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  async function checkGitHubStatus() {
    if (!user) return

    try {
      console.log('Repos page: Checking GitHub status...')
      const idToken = await user.getIdToken()
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131317] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 text-primary animate-spin shadow-glow" />
          <p className="text-primary/40 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Nodes...</p>
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#131317] flex items-center justify-center p-10 selection:bg-primary selection:text-black">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center relative z-10"
        >
          <div className="w-24 h-24 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <Github className="w-12 h-12 text-white/20" />
          </div>
          <h1 className="text-4xl font-black text-white mb-6 tracking-tighter">
            Architectural <span className="text-white/10 italic">Mesh.</span>
          </h1>
          <p className="text-white/30 mb-12 font-medium italic border-l border-primary/20 pl-8 text-left">
            Establish a secure connection with your GitHub architectural core to initialize neural monitoring across your delivery stacks.
          </p>
          
          <Link 
            href="/api/auth/github"
            className="inline-flex items-center gap-4 bg-primary text-black font-black uppercase tracking-[0.2em] text-[11px] px-10 py-5 rounded-xl hover:bg-white transition-all shadow-glow"
          >
            <Github className="w-5 h-5" />
            Initialize Connection
          </Link>
          {error && (
            <p className="mt-8 text-primary/40 text-[10px] font-black uppercase tracking-widest">{error}</p>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="py-24 lg:py-16 selection:bg-primary selection:text-black">
      <div className="max-w-[1120px] mx-auto relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-8">
          <div>
            <span className="text-[9px] lg:text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-3 lg:mb-4 block text-glow">Node Discovery</span>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none">
              Repository <span className="text-white/10 italic">Manifests.</span>
            </h1>
            <p className="text-white/30 mt-6 lg:mt-8 font-medium italic border-l border-primary/20 pl-8 text-sm lg:text-base">
              {githubRepos.length} discovered units · {monitoredRepos.length} active nodes
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/20 hover:text-primary transition-all font-black uppercase tracking-[0.3em] text-[10px] group flex items-center gap-3"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Deck
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-12 group z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search discovered repositories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 transition-all focus:bg-white/[0.08]"
          />
        </div>

        {/* Repo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {filteredRepos.map((repo, i) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card border-white/5 rounded-[24px] p-6 md:p-8 hover:bg-white/[0.03] hover:border-primary/20 transition-all duration-700 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {repo.private ? (
                    <Lock className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                  ) : (
                    <Globe className="w-4 h-4 text-primary/20 group-hover:text-primary transition-colors" />
                  )}
                  <Link
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-black tracking-tight hover:text-primary transition-all truncate max-w-[140px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {repo.name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-white/10 text-[10px] font-black uppercase tracking-widest group-hover:text-white/30 transition-colors">
                    <Star className="w-3 h-3" />
                    {repo.stars}
                  </div>
                </div>
              </div>

              {repo.description && (
                <p className="text-white/30 text-[13px] mb-8 line-clamp-2 min-h-[40px] leading-relaxed font-medium italic group-hover:text-white/50 transition-colors">
                  {repo.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-8">
                {repo.language && (
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 bg-primary/5 px-3 py-1.5 rounded-full shadow-glow">
                    {repo.language}
                  </span>
                )}
                
                {isMonitored(repo.id) ? (
                  <span className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em] ml-auto">
                    <CheckCircle className="w-4 h-4 shadow-glow" />
                    In Deck
                  </span>
                ) : (
                  <button
                    onClick={() => addRepo(repo)}
                    disabled={adding === repo.id}
                    className="ml-auto flex items-center gap-3 bg-white/5 hover:bg-primary hover:text-black hover:shadow-glow disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl transition-all border border-white/5 grow flex justify-center"
                  >
                    {adding === repo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Initialize
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <div className="text-center py-32 text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">
            No architectural units identified matching "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
