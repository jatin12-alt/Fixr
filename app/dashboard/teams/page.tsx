'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

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
      case 'OWNER': return 'bg-primary text-black'
      case 'ADMIN': return 'bg-white/10 text-white'
      case 'MEMBER': return 'bg-white/5 text-white/60'
      default: return 'bg-white/5 text-white/40'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-16 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-12">
            <div className="h-12 bg-white/5 rounded-2xl w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card border-white/5 rounded-[32px] p-10 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-10 selection:bg-primary selection:text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 block text-glow">Collaborative Nodes</span>
            <h1 className="text-5xl font-black text-white tracking-tighter">Team <span className="text-white/10 italic">Structures.</span></h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-3 px-8 py-4 bg-primary text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-glow group"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            <span>Initialize Team</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <input
              type="text"
              placeholder="Search neural networks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/5 rounded-2xl text-white font-medium placeholder-white/20 focus:outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <button className="flex items-center space-x-4 px-8 py-5 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white hover:border-white/20 transition-all group">
            <Filter className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Filter Protocol</span>
          </button>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-32 glass-card rounded-[40px] border-dashed border-white/5">
            <Users className="h-16 w-16 text-white/5 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
              {searchTerm ? 'No Nodes Detected' : 'Team Buffer Empty'}
            </h3>
            <p className="text-white/20 font-medium mb-10 max-w-sm mx-auto">
              {searchTerm 
                ? 'Try adjusting your frequency search terms'
                : 'Initialize your first team structure to begin collaborative resolution.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-black transition-all"
              >
                Initialize Structure
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group h-full"
              >
                <Link href={`/dashboard/teams/${team.id}`}>
                  <div className="glass-card border-white/5 rounded-[32px] p-10 h-full hover:bg-white/[0.03] hover:border-primary/20 transition-all duration-500 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between mb-10">
                      <div className="flex items-center space-x-5">
                        {team.avatarUrl ? (
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10">
                            <Image src={team.avatarUrl} alt={team.name} width={56} height={56} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-[#1b1b1f] to-[#0e0e11] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl skew-y-1">
                            <span className="text-white font-black text-2xl tracking-tighter">
                              {team.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-black text-xl tracking-tight group-hover:text-primary transition-colors">{team.name}</h3>
                          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">/{team.slug}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-white/5",
                        getRoleColor(team.userRole)
                      )}>
                        {team.userRole}
                      </span>
                    </div>

                    <div className="space-y-4 mb-10 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Personnel</span>
                        <span className="text-white font-bold">{team._count.members}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Assets</span>
                        <span className="text-white font-bold">{team._count.repositories}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Synced</span>
                        <span className="text-white/60 text-xs font-medium">
                          {new Date(team.userJoinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Recent members */}
                    {team.members.length > 0 && (
                      <div className="pt-6 border-t border-white/5">
                        <div className="flex -space-x-3">
                          {team.members.slice(0, 4).map((member) => (
                            <div
                              key={member.id}
                              className="w-8 h-8 rounded-full bg-[#131317] border-2 border-[#0e0e11] flex items-center justify-center overflow-hidden ring-1 ring-white/5"
                            >
                              {member.user.avatarUrl ? (
                                <Image src={member.user.avatarUrl} alt={member.user.name} width={32} height={32} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[10px] font-black text-white/40">
                                  {member.user.name?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                          ))}
                          {team._count.members > 4 && (
                            <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#0e0e11] flex items-center justify-center ring-1 ring-white/5">
                              <span className="text-[10px] font-black text-white/40">
                                +{team._count.members - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Team Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateTeamModal
              onClose={() => setShowCreateModal(false)}
              onCreated={() => {
                setShowCreateModal(false)
                fetchTeams()
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

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
      if (response.ok) onCreated()
      else {
        const error = await response.json()
        alert(error.error || 'Relay failure')
      }
    } catch (error) {
      alert('Relay failure')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug) setSlug(generateSlug(value))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#0e0e11] border border-white/10 rounded-[40px] p-12 max-w-md w-full relative z-[101] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-4 block">New Protocol</span>
        <h2 className="text-3xl font-black text-white mb-10 tracking-tight">Initialize Team.</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.1em]">Structure Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. CORE-ARCHITECTS"
              className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold placeholder-white/10 focus:outline-none focus:border-primary/40 transition-all"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-white/40 uppercase tracking-[0.1em]">Protocol Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="structure-id"
              className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold placeholder-white/10 focus:outline-none focus:border-primary/40 transition-all font-mono text-sm"
              pattern="^[a-z0-9-]+$"
              required
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-white/5 text-white/40 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-primary text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white disabled:opacity-30 transition-all shadow-glow"
            >
              {loading ? 'Initializing...' : 'Confirm Structure'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
