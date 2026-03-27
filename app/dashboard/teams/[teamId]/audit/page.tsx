'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  Clock, 
  User, 
  GitBranch, 
  Settings, 
  Filter,
  ChevronDown,
  Search
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  createdAt: string
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
  userRole: string
  userPermissions: {
    canViewAuditLogs: boolean
  }
}

export default function TeamAuditPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string

  const [team, setTeam] = useState<Team | null>(null)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    startDate: '',
    endDate: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (teamId) {
      fetchTeam()
      fetchLogs()
    }
  }, [teamId])

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data)
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
    }
  }

  const fetchLogs = async (reset = true) => {
    try {
      const params = new URLSearchParams({
        limit: '50',
        ...(reset && { offset: '0' }),
        ...(filters.action && { action: filters.action }),
        ...(filters.user && { user: filters.user }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const response = await fetch(`/api/teams/${teamId}/audit?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (reset) {
          setLogs(data.logs)
        } else {
          setLogs(prev => [...prev, ...data.logs])
        }
        setTotalCount(data.totalCount)
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchLogs(true)
  }

  const clearFilters = () => {
    setFilters({
      action: '',
      user: '',
      startDate: '',
      endDate: '',
    })
    setTimeout(() => fetchLogs(true), 0)
  }

  const loadMore = () => {
    if (hasMore) {
      fetchLogs(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'team.created': return <Settings className="h-4 w-4" />
      case 'member.invited': return <User className="h-4 w-4" />
      case 'member.joined': return <User className="h-4 w-4" />
      case 'member.removed': return <User className="h-4 w-4" />
      case 'member.role_changed': return <User className="h-4 w-4" />
      case 'repo.connected': return <GitBranch className="h-4 w-4" />
      case 'repo.disconnected': return <GitBranch className="h-4 w-4" />
      case 'fix.applied': return <Settings className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('joined')) return 'text-green-400'
    if (action.includes('removed') || action.includes('disconnected')) return 'text-red-400'
    if (action.includes('role_changed') || action.includes('updated')) return 'text-yellow-400'
    return 'text-primary'
  }

  const formatAction = (action: string) => {
    return action.split('.').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatMetadata = (metadata?: Record<string, any>) => {
    if (!metadata) return null

    const entries = Object.entries(metadata).map(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').trim()
      return `${formattedKey}: ${value}`
    })

    return entries.length > 0 ? entries.join(', ') : null
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

  if (!team || !team.userPermissions.canViewAuditLogs) {
    return (
      <div className="min-h-screen bg-black text-muted-foreground py-8 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Access denied</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-muted-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/dashboard/teams/${teamId}`)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Team
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
              <p className="text-muted-foreground">{team.name} • {totalCount} events</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-muted/50 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-card text-muted-foreground rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {(filters.action || filters.user || filters.startDate || filters.endDate) && (
                <button
                  onClick={clearFilters}
                  className="text-primary hover:text-cyan-300 text-sm"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {logs.length} of {totalCount} events
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label htmlFor="action-filter" className="block text-sm font-medium text-muted-foreground mb-1">Action</label>
                <select
                  id="action-filter"
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-cyan-500"
                  aria-label="Filter by action"
                >
                  <option value="">All actions</option>
                  <option value="team.created">Team Created</option>
                  <option value="member.invited">Member Invited</option>
                  <option value="member.joined">Member Joined</option>
                  <option value="member.removed">Member Removed</option>
                  <option value="member.role_changed">Role Changed</option>
                  <option value="repo.connected">Repository Connected</option>
                  <option value="repo.disconnected">Repository Disconnected</option>
                  <option value="fix.applied">Fix Applied</option>
                </select>
              </div>

              <div>
                <label htmlFor="user-filter" className="block text-sm font-medium text-muted-foreground mb-1">User</label>
                <input
                  id="user-filter"
                  type="text"
                  value={filters.user}
                  onChange={(e) => handleFilterChange('user', e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  aria-label="Search by user"
                />
              </div>

              <div>
                <label htmlFor="start-date-filter" className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                <input
                  id="start-date-filter"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-cyan-500"
                  aria-label="Start date filter"
                />
              </div>

              <div>
                <label htmlFor="end-date-filter" className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                <input
                  id="end-date-filter"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-cyan-500"
                  aria-label="End date filter"
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Audit Logs */}
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No audit logs found</h3>
            <p className="text-muted-foreground">
              {filters.action || filters.user || filters.startDate || filters.endDate
                ? 'Try adjusting your filters'
                : 'Audit logs will appear here as team activities occur'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-muted/50 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg bg-card ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-foreground font-medium">
                          {formatAction(log.action)}
                        </h3>
                        {log.resourceType && (
                          <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded">
                            {log.resourceType}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center space-x-2">
                          {log.user.avatarUrl ? (
                            <img
                              src={log.user.avatarUrl}
                              alt={log.user.name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-xs text-foreground">
                                {(log.user.name || log.user.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span>{log.user.name || log.user.email}</span>
                        </div>
                        
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                        
                        {log.ipAddress && (
                          <>
                            <span>•</span>
                            <span>{log.ipAddress}</span>
                          </>
                        )}
                      </div>
                      
                      {formatMetadata(log.metadata) && (
                        <div className="text-sm text-muted-foreground bg-card rounded p-2">
                          {formatMetadata(log.metadata)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="px-4 py-2 bg-card text-muted-foreground rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
