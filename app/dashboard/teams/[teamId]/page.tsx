'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  Users, 
  Settings, 
  GitBranch, 
  FileText, 
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  Crown,
  UserCheck,
  Eye,
  Settings2,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { AnimatePresence } from 'framer-motion'

interface TeamMember {
  id: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
}

interface Team {
  id: string
  name: string
  slug: string
  avatarUrl?: string
  userRole: string
  userPermissions: {
    canManageTeam: boolean
    canInviteMembers: boolean
    canRemoveMembers: boolean
    canManageRepos: boolean
    canViewAnalytics: boolean
    canManageSettings: boolean
    canViewAuditLogs: boolean
  }
  members: TeamMember[]
  repositories: Array<{
    id: string
    name: string
    fullName: string
    isActive: boolean
    createdAt: string
  }>
  _count: {
    members: number
    repositories: number
  }
  createdAt: string
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'repositories' | 'settings'>('overview')
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    if (teamId) {
      fetchTeam()
    }
  }, [teamId])

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data)
      } else if (response.status === 404) {
        router.push('/dashboard/teams')
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <Crown className="h-4 w-4" />
      case 'ADMIN': return <Shield className="h-4 w-4" />
      case 'MEMBER': return <UserCheck className="h-4 w-4" />
      case 'VIEWER': return <Eye className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'text-purple-400 bg-purple-900/20'
      case 'ADMIN': return 'text-primary bg-cyan-900/20'
      case 'MEMBER': return 'text-blue-400 bg-blue-900/20'
      case 'VIEWER': return 'text-muted-foreground bg-muted/20'
      default: return 'text-muted-foreground bg-muted/20'
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
      <div className="min-h-screen py-16 px-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="animate-pulse h-12 bg-white/5 rounded-2xl w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[500px] bg-white/5 border border-white/5 rounded-[40px]"></div>
            <div className="h-[500px] bg-white/5 border border-white/5 rounded-[40px]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-black text-muted-foreground py-8 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Team not found</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Users className="h-4 w-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
    { id: 'repositories', label: 'Repositories', icon: <GitBranch className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ].filter(tab => {
    if (tab.id === 'settings' && !team.userPermissions.canManageSettings) return false
    return true
  })

  return (
    <div className="min-h-screen py-16 px-10 selection:bg-primary selection:text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div className="flex items-center space-x-6">
            <Link 
              href="/dashboard/teams"
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 text-white/40 hover:text-white hover:border-white/20 transition-all group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center space-x-5">
              {team.avatarUrl ? (
                <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-white/5 border border-white/5 p-1">
                  <Image src={team.avatarUrl} alt={team.name} width={64} height={64} className="w-full h-full object-cover rounded-[15px]" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-[#1b1b1f] to-[#0e0e11] border border-white/10 rounded-[20px] flex items-center justify-center shadow-2xl skew-y-1">
                  <span className="text-white font-black text-3xl tracking-tighter">
                    {team.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-black text-white tracking-tighter leading-none">{team.name}</h1>
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border",
                    getRoleColor(team.userRole)
                  )}>
                    {team.userRole}
                  </span>
                </div>
                <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.3em]">/{team.slug} • Protocol v1.4.2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-12 bg-white/5 p-1.5 rounded-2xl w-fit border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-3 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === tab.id
                  ? 'bg-primary text-black shadow-glow'
                  : 'text-white/30 hover:bg-white/5 hover:text-white'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Stats */}
            <div className="lg:col-span-2 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="glass-card border-white/5 rounded-[40px] p-12 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-primary transition-colors">Neural Personnel</h3>
                    <Users className="h-5 w-5 text-primary/40 group-hover:text-primary transition-all" />
                  </div>
                  <div className="flex items-baseline gap-4">
                    <p className="text-6xl font-black text-white tracking-tighter">{team._count.members}</p>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 uppercase">Active Units</span>
                  </div>
                </div>
                
                <div className="glass-card border-white/5 rounded-[40px] p-12 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-primary transition-colors">Connected Assets</h3>
                    <GitBranch className="h-5 w-5 text-primary/40 group-hover:text-primary transition-all" />
                  </div>
                  <div className="flex items-baseline gap-4">
                    <p className="text-6xl font-black text-white tracking-tighter">{team._count.repositories}</p>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 uppercase">Synced Nodes</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-card border-white/5 rounded-[40px] p-12 overflow-hidden relative">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-2xl font-black text-white tracking-tighter">Unit Registry</h3>
                  <Users className="h-5 w-5 text-white/10" />
                </div>
                <div className="space-y-6">
                  {team.members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between group/item p-4 rounded-2xl hover:bg-white/5 transition-all">
                      <div className="flex items-center space-x-5">
                        {member.user.avatarUrl ? (
                          <div className="w-12 h-12 rounded-xl border border-white/10 p-0.5">
                            <Image src={member.user.avatarUrl} alt={member.user.name} width={48} height={48} className="w-full h-full object-cover rounded-[10px]" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                            <span className="text-white/40 font-black text-sm">
                              {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-bold tracking-tight">
                            {member.user.name || member.user.email}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">{member.user.email}</p>
                        </div>
                      </div>
                      <span className={cn(
                         "px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border",
                         getRoleColor(member.role)
                      )}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-10">
              <div className="glass-card border-white/5 rounded-[40px] p-12 bg-gradient-to-br from-white/[0.02] to-transparent">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-10">Command Center</h3>
                <div className="space-y-4">
                  {team.userPermissions.canInviteMembers && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="w-full flex items-center justify-center space-x-3 px-6 py-5 bg-primary text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all shadow-glow"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Invite Personnel</span>
                    </button>
                  )}
                  
                  {team.userPermissions.canManageRepos && (
                    <Link
                      href="/dashboard/repos/new"
                      className="w-full flex items-center justify-center space-x-3 px-6 py-5 bg-white/5 border border-white/5 text-white/40 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-black transition-all"
                    >
                      <GitBranch className="h-4 w-4" />
                      <span>Sync Asset</span>
                    </Link>
                  )}
                  
                  {team.userPermissions.canViewAnalytics && (
                    <Link
                      href={`/dashboard/analytics?team=${teamId}`}
                      className="w-full flex items-center justify-center space-x-3 px-6 py-5 bg-white/5 border border-white/5 text-white/40 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-black transition-all"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Telemetry Logs</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="glass-card border-white/5 rounded-[40px] p-12 ring-1 ring-primary/10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">Metadata</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10 mb-2">Structure Epoch</p>
                    <p className="text-white font-black tracking-tight">
                      {new Date(team.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10 mb-2">Assigned Protocol</p>
                    <div className={cn(
                       "inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border",
                       getRoleColor(team.userRole)
                    )}>
                      {team.userRole}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <MembersSection 
            team={team} 
            onInvite={() => setShowInviteModal(true)}
            onUpdate={fetchTeam}
          />
        )}

        {activeTab === 'repositories' && (
          <RepositoriesSection team={team} />
        )}

        {activeTab === 'settings' && (
          <SettingsSection team={team} onUpdate={fetchTeam} />
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <InviteMemberModal
            teamId={teamId}
            onClose={() => setShowInviteModal(false)}
            onInvited={() => {
              setShowInviteModal(false)
              fetchTeam()
            }}
          />
        )}
      </div>
    </div>
  )
}

// Members Section Component
function MembersSection({ 
  team, 
  onInvite, 
  onUpdate 
}: { 
  team: Team; 
  onInvite: () => void; 
  onUpdate: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState(team.members)

  const filteredMembers = members.filter(member =>
    (member.user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'text-primary border-primary/20 bg-primary/5 shadow-glow-subtle'
      case 'ADMIN': return 'text-white/80 border-white/10 bg-white/5'
      case 'MEMBER': return 'text-white/40 border-white/5 bg-white/5'
      default: return 'text-white/20 border-white/5 bg-transparent'
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white tracking-tighter">Unit Registry</h2>
        {team.userPermissions.canInviteMembers && (
          <button
            onClick={onInvite}
            className="flex items-center space-x-3 px-6 py-3 bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-black transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Invite Personnel</span>
          </button>
        )}
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search personnel directory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/5 rounded-2xl text-white font-medium placeholder-white/10 focus:outline-none focus:border-primary/40 transition-all"
        />
      </div>

      <div className="glass-card border-white/5 rounded-[32px] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-8 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/10 bg-white/[0.02]">
          <div className="col-span-6">Registry Entry</div>
          <div className="col-span-2 text-center">Protocol</div>
          <div className="col-span-2 text-center">Epoch</div>
          <div className="col-span-2 text-right">Link</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {filteredMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-12 gap-4 p-8 items-center hover:bg-white/[0.03] transition-all group/row">
              <div className="col-span-6 flex items-center space-x-5">
                {member.user.avatarUrl ? (
                  <div className="w-12 h-12 rounded-xl border border-white/10 p-0.5">
                    <Image src={member.user.avatarUrl} alt={member.user.name} width={48} height={48} className="w-full h-full object-cover rounded-[10px]" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-[#131317] border border-white/10 rounded-xl flex items-center justify-center">
                    <span className="text-white/40 font-black text-sm">
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white font-bold tracking-tight">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">{member.user.email}</p>
                </div>
              </div>
              
              <div className="col-span-2 flex justify-center">
                <span className={cn(
                   "px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border",
                   getRoleColor(member.role)
                )}>
                  {member.role}
                </span>
              </div>
              
              <div className="col-span-2 text-center text-xs font-medium text-white/40">
                {new Date(member.joinedAt).toLocaleDateString()}
              </div>
              
              <div className="col-span-2 flex justify-end">
                {team.userPermissions.canRemoveMembers && member.user.id !== team.userRole && (
                  <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-white/20 hover:text-red-400 hover:border-red-400/30 transition-all">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Repositories Section Component
function RepositoriesSection({ team }: { team: Team }) {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white tracking-tighter">Synced Assets</h2>
        {team.userPermissions.canManageRepos && (
          <Link
            href="/dashboard/repos/new"
            className="flex items-center space-x-3 px-6 py-3 bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-primary hover:text-black transition-all shadow-glow"
          >
            <Plus className="h-4 w-4" />
            <span>Sync New Asset</span>
          </Link>
        )}
      </div>

      {team.repositories.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-[40px] border-dashed border-white/5 px-10">
          <GitBranch className="h-16 w-16 text-white/5 mx-auto mb-8" />
          <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Vessel Void</h3>
          <p className="text-white/20 font-medium mb-12 max-w-sm mx-auto italic">
            "No architectural assets currently linked to this node structure."
          </p>
          {team.userPermissions.canManageRepos && (
            <Link
              href="/dashboard/repos/new"
              className="inline-flex items-center space-x-6 px-10 py-5 bg-primary text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-glow"
            >
              <Plus className="h-4 w-4" />
              <span>Link Initial Repository</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="glass-card border-white/5 rounded-[32px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-8 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/10 bg-white/[0.02]">
            <div className="col-span-6">Asset Identifier</div>
            <div className="col-span-2 text-center">Pulse</div>
            <div className="col-span-2 text-center">Sync Date</div>
            <div className="col-span-2 text-right">Terminal</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {team.repositories.map((repo) => (
              <div key={repo.id} className="grid grid-cols-12 gap-4 p-8 items-center hover:bg-white/[0.03] transition-all group/row">
                <div className="col-span-6">
                  <p className="text-white font-bold tracking-tight group-hover/row:text-primary transition-colors">{repo.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">{repo.fullName}</p>
                </div>
                
                <div className="col-span-2 flex justify-center">
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border",
                    repo.isActive 
                      ? 'border-primary/20 bg-primary/5 text-primary shadow-glow-subtle' 
                      : 'border-white/5 bg-transparent text-white/20'
                  )}>
                    {repo.isActive ? 'Active' : 'Idle'}
                  </span>
                </div>
                
                <div className="col-span-2 text-center text-xs font-medium text-white/40">
                  {new Date(repo.createdAt).toLocaleDateString()}
                </div>
                
                <div className="col-span-2 flex justify-end">
                  <Link
                    href={`/dashboard/repos/${repo.id}`}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-white/20 hover:text-primary hover:border-primary/30 transition-all shadow-subtle"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Settings Section Component
function SettingsSection({ team, onUpdate }: { team: Team; onUpdate: () => void }) {
  const [name, setName] = useState(team.name)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update team')
      }
    } catch (error) {
      console.error('Failed to update team:', error)
      alert('Failed to update team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div className="glass-card border-white/5 rounded-[40px] p-12">
        <h3 className="text-2xl font-black text-white tracking-tighter mb-10">Team Configuration</h3>
        
        <div className="space-y-8">
          <div>
            <label htmlFor="team-name" className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">
              Organization Name
            </label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-primary/40 transition-all placeholder-white/5"
              aria-label="Team name"
            />
          </div>

          <div className="flex items-center justify-between py-8 border-y border-white/5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 mb-1">Assigned Path</p>
              <p className="text-white font-bold tracking-tight">/{team.slug}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={loading || name === team.name}
              className="px-8 py-4 bg-primary text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white disabled:opacity-20 transition-all shadow-glow"
            >
              {loading ? 'Syncing...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      {team.userRole === 'OWNER' && (
        <div className="glass-card border-red-500/10 rounded-[40px] p-12 bg-red-500/[0.02]">
          <h3 className="text-xl font-black text-red-400 tracking-tighter mb-4 uppercase">Terminal Destruction</h3>
          <p className="text-white/30 text-sm font-medium mb-8 italic">
            "Requesting permanent deletion of all neural paths associated with this organization. This action is irreversible."
          </p>
          <button className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 hover:text-white transition-all">
            Initiate Deletion
          </button>
        </div>
      )}
    </div>
  )
}

// Invite Member Modal Component
function InviteMemberModal({ 
  teamId, 
  onClose, 
  onInvited 
}: { 
  teamId: string; 
  onClose: () => void; 
  onInvited: () => void;
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      if (response.ok) {
        onInvited()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to invite member')
      }
    } catch (error) {
      console.error('Failed to invite member:', error)
      alert('Failed to invite member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 selection:bg-primary selection:text-black"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card border-white/10 rounded-[40px] p-12 max-w-lg w-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-10" />
          
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Personnel Draft</h2>
          <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.3em] mb-10">Assigning new neural link</p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-3">
                Digital Identifier (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="unit@protocol.syn"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder-white/5 focus:outline-none focus:border-primary/40 transition-all font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mb-3">
                Privilege Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-6 py-4 bg-[#131317] border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer"
              >
                <option value="VIEWER">Observer - Sensory access only</option>
                <option value="MEMBER">Operative - Standard node management</option>
                <option value="ADMIN">Architect - Full structural control</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-5 bg-white/5 border border-white/5 text-white/20 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:text-white hover:border-white/20 transition-all order-2 sm:order-1"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-5 bg-primary text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white disabled:opacity-20 transition-all shadow-glow order-1 sm:order-2"
              >
                {loading ? 'Initializing...' : 'Authorize Link'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
