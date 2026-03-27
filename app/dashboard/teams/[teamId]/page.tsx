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
  Settings2
} from 'lucide-react'
import Link from 'next/link'

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
      <div className="min-h-screen bg-black text-muted-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-muted/50 border border-gray-800 rounded-xl"></div>
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
    <div className="min-h-screen bg-black text-muted-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/teams"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Teams
            </Link>
            <div className="flex items-center space-x-3">
              {team.avatarUrl ? (
                <img
                  src={team.avatarUrl}
                  alt={team.name}
                  className="w-12 h-12 rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-foreground font-bold text-lg">
                    {team.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-foreground">{team.name}</h1>
                <p className="text-muted-foreground">/{team.slug}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 ${getRoleColor(team.userRole)}`}>
              {getRoleIcon(team.userRole)}
              <span>{getRoleLabel(team.userRole)}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted/50 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Team Members</h3>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{team._count.members}</p>
                  <p className="text-sm text-muted-foreground mt-2">Active collaborators</p>
                </div>
                
                <div className="bg-muted/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Repositories</h3>
                    <GitBranch className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{team._count.repositories}</p>
                  <p className="text-sm text-muted-foreground mt-2">Connected repositories</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-muted/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Members</h3>
                <div className="space-y-3">
                  {team.members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {member.user.avatarUrl ? (
                          <img
                            src={member.user.avatarUrl}
                            alt={member.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-xs text-foreground">
                              {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-foreground font-medium">
                            {member.user.name || member.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span>{getRoleLabel(member.role)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-muted/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {team.userPermissions.canInviteMembers && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Invite Member</span>
                    </button>
                  )}
                  
                  {team.userPermissions.canManageRepos && (
                    <Link
                      href="/dashboard/repos/new"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-card text-muted-foreground rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <GitBranch className="h-4 w-4" />
                      <span>Connect Repository</span>
                    </Link>
                  )}
                  
                  {team.userPermissions.canViewAnalytics && (
                    <Link
                      href={`/dashboard/analytics?team=${teamId}`}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-card text-muted-foreground rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Analytics</span>
                    </Link>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Team Info</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-foreground">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Role</p>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(team.userRole)}`}>
                      {getRoleIcon(team.userRole)}
                      <span>{getRoleLabel(team.userRole)}</span>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
        {team.userPermissions.canInviteMembers && (
          <button
            onClick={onInvite}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="bg-muted/50 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 text-sm font-medium text-muted-foreground">
          <div className="col-span-6">Member</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        <div className="divide-y divide-gray-800">
          {filteredMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-card/50 transition-colors">
              <div className="col-span-6 flex items-center space-x-3">
                {member.user.avatarUrl ? (
                  <img
                    src={member.user.avatarUrl}
                    alt={member.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs text-foreground">
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-foreground font-medium">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              
              <div className="col-span-2">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                  {getRoleIcon(member.role)}
                  <span>{getRoleLabel(member.role)}</span>
                </span>
              </div>
              
              <div className="col-span-2 text-sm text-muted-foreground">
                {new Date(member.joinedAt).toLocaleDateString()}
              </div>
              
              <div className="col-span-2">
                {team.userPermissions.canRemoveMembers && member.user.id !== team.userRole && (
                  <button className="text-muted-foreground hover:text-red-400 transition-colors">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Repositories</h2>
        {team.userPermissions.canManageRepos && (
          <Link
            href="/dashboard/repos/new"
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Connect Repository</span>
          </Link>
        )}
      </div>

      {team.repositories.length === 0 ? (
        <div className="text-center py-12">
          <GitBranch className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No repositories connected</h3>
          <p className="text-muted-foreground mb-6">
            Connect your first repository to start monitoring your pipelines
          </p>
          {team.userPermissions.canManageRepos && (
            <Link
              href="/dashboard/repos/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Connect Repository</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-muted/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 text-sm font-medium text-muted-foreground">
            <div className="col-span-6">Repository</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Connected</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          <div className="divide-y divide-gray-800">
            {team.repositories.map((repo) => (
              <div key={repo.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-card/50 transition-colors">
                <div className="col-span-6">
                  <p className="text-foreground font-medium">{repo.name}</p>
                  <p className="text-sm text-muted-foreground">{repo.fullName}</p>
                </div>
                
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    repo.isActive 
                      ? 'bg-green-900/20 text-green-400' 
                      : 'bg-muted/20 text-muted-foreground'
                  }`}>
                    {repo.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="col-span-2 text-sm text-muted-foreground">
                  {new Date(repo.createdAt).toLocaleDateString()}
                </div>
                
                <div className="col-span-2">
                  <Link
                    href={`/dashboard/repos/${repo.id}`}
                    className="text-primary hover:text-cyan-300 text-sm"
                  >
                    View Details
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
    <div className="max-w-2xl space-y-6">
      <div className="bg-muted/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Team Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="team-name" className="block text-sm font-medium text-muted-foreground mb-1">
              Team Name
            </label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-cyan-500"
              aria-label="Team name"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Team Slug</p>
              <p className="text-foreground">/{team.slug}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={loading || name === team.name}
              className="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {team.userRole === 'OWNER' && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
          <p className="text-muted-foreground mb-4">
            Once you delete a team, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-red-600 text-foreground rounded-lg hover:bg-red-700 transition-colors">
            Delete Team
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
        <h2 className="text-xl font-bold text-foreground mb-4">Invite Team Member</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-cyan-500"
            >
              <option value="VIEWER">Viewer - Read-only access</option>
              <option value="MEMBER">Member - Can manage repositories</option>
              <option value="ADMIN">Admin - Can manage members</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-card text-muted-foreground rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
