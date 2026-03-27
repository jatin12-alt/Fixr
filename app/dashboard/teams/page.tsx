'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface Team {
  id: string
  name: string
  slug: string
  avatarUrl?: string
  userRole: string
  userJoinedAt: string
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
      avatarUrl?: string
    }
  }>
  repositories: Array<{
    id: string
    name: string
    fullName: string
    isActive: boolean
  }>
  _count: {
    members: number
    repositories: number
  }
  createdAt: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-500'
      case 'ADMIN': return 'bg-primary'
      case 'MEMBER': return 'bg-blue-500'
      case 'VIEWER': return 'bg-gray-500'
      default: return 'bg-gray-500'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted/50 border border-gray-800 rounded-xl p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Teams</h1>
            <p className="text-muted-foreground">
              Manage your team collaborations and permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Team</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-muted border border-border rounded-lg hover:border-cyan-500 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'No teams found' : 'No teams yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first team to start collaborating with your team'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Create Your First Team
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/50 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                <Link href={`/dashboard/teams/${team.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {team.avatarUrl ? (
                        <img
                          src={team.avatarUrl}
                          alt={team.name}
                          className="w-10 h-10 rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-foreground font-bold">
                            {team.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-foreground font-semibold">{team.name}</h3>
                        <p className="text-muted-foreground text-sm">/{team.slug}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium text-foreground rounded-full ${getRoleColor(team.userRole)}`}>
                      {getRoleLabel(team.userRole)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="text-foreground">{team._count.members}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Repositories</span>
                      <span className="text-foreground">{team._count.repositories}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="text-foreground">
                        {new Date(team.userJoinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Recent members preview */}
                  {team.members.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-muted-foreground mb-2">Recent members</p>
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 4).map((member) => (
                          <div
                            key={member.id}
                            className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center"
                            title={member.user.name || member.user.email}
                          >
                            {member.user.avatarUrl ? (
                              <img
                                src={member.user.avatarUrl}
                                alt={member.user.name}
                                className="w-full h-full rounded-full"
                              />
                            ) : (
                              <span className="text-xs text-foreground">
                                {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        ))}
                        {team.members.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              +{team.members.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateModal && (
          <CreateTeamModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false)
              fetchTeams()
            }}
          />
        )}
      </div>
    </div>
  )
}

// Create Team Modal Component
function CreateTeamModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      })

      if (response.ok) {
        onCreated()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create team')
      }
    } catch (error) {
      console.error('Failed to create team:', error)
      alert('Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug) {
      setSlug(generateSlug(value))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-muted border border-gray-800 rounded-xl p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-bold text-foreground mb-4">Create New Team</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Team"
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Team Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-awesome-team"
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              pattern="^[a-z0-9-]+$"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only lowercase letters, numbers, and hyphens
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-card text-primary rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
