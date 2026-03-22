'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/Navigation'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  updated_at: string
  has_workflows: boolean
}

export default function ReposPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/repos')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/api/auth/github')
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setRepos(data)
    } catch (err) {
      console.error('Failed to fetch repositories:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories')
    } finally {
      setLoading(false)
    }
  }

  const connectRepository = async (repo: GitHubRepo) => {
    try {
      setConnecting(repo.id)
      
      const response = await fetch('/api/repos/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubId: repo.id.toString(),
          name: repo.name,
          fullName: repo.full_name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const serverError = errorData?.error || 'Failed to connect repository'
        
        if (response.status === 409) {
          // Repo is already connected! Let's gracefully proceed to dashboard.
          router.push('/dashboard')
          return
        }
        
        alert(`Error: ${serverError}`)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to connect repository:', err)
      alert('Network or client error. Please try again.')
    } finally {
      setConnecting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your repositories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <Card className="bg-gray-900 border-red-700">
            <CardHeader>
              <CardTitle className="text-red-400">Error Loading Repositories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={fetchRepositories}>
                  Retry
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/api/auth/github')}
                >
                  Reconnect GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Select Repositories</h1>
            <p className="text-gray-400">Choose which repositories you want Fixr to monitor</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        {repos.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-400 mb-4">
                No repositories found. Make sure you have repositories with GitHub Actions workflows.
              </p>
              <Button onClick={fetchRepositories}>
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <Card 
                key={repo.id}
                className="bg-gray-900 border-gray-700 hover:border-cyan-500 transition-colors cursor-pointer"
                onClick={() => {
                  if (isConnected) {
                    router.push(`/repos/${repo.id}`)
                  } else {
                    !isConnecting && connectRepository(repo)
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs bg-yellow-600 px-2 py-1 rounded">Private</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {repo.description || 'No description available'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={() => connectRepository(repo)}
                    disabled={connecting === repo.id}
                    className="w-full"
                  >
                    {connecting === repo.id ? 'Connecting...' : 'Connect Repository'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
