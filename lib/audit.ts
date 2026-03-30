import { db } from '@/lib/db'
import { AuditLog, TeamMember, auditLogs, users, teams } from '@/lib/db'
import { eq, and, desc, gte, lte, count } from 'drizzle-orm'

interface CreateAuditLogData {
  teamId?: number
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
}

export async function createAuditLog(data: CreateAuditLogData): Promise<AuditLog> {
  try {
    const [auditLog] = await db.insert(auditLogs).values({
      teamId: data.teamId,
      userId: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      ipAddress: data.ipAddress,
    }).returning()

    return auditLog
  } catch (error) {
    console.error('Failed to create audit log:', error)
    throw error
  }
}

// Specific audit log helpers
export async function logTeamCreated(
  userId: string,
  teamId: number,
  teamName: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'team.created',
    resourceType: 'team',
    resourceId: teamId.toString(),
    metadata: { teamName },
    ipAddress,
  })
}

export async function logMemberInvited(
  userId: string,
  teamId: number,
  inviteeEmail: string,
  role: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'member.invited',
    resourceType: 'member',
    metadata: { inviteeEmail, role },
    ipAddress,
  })
}

export async function logMemberJoined(
  userId: string,
  teamId: number,
  inviteId: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'member.joined',
    resourceType: 'member',
    resourceId: userId.toString(),
    metadata: { inviteId },
    ipAddress,
  })
}

export async function logMemberRemoved(
  userId: string,
  teamId: number,
  removedUserId: string,
  removedUserName: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'member.removed',
    resourceType: 'member',
    resourceId: removedUserId.toString(),
    metadata: { removedUserId, removedUserName },
    ipAddress,
  })
}

export async function logRoleChanged(
  userId: string,
  teamId: number,
  targetUserId: string,
  oldRole: string,
  newRole: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'member.role_changed',
    resourceType: 'member',
    resourceId: targetUserId.toString(),
    metadata: { targetUserId, oldRole, newRole },
    ipAddress,
  })
}

export async function logRepoConnected(
  userId: string,
  teamId: number,
  repoId: number,
  repoName: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'repo.connected',
    resourceType: 'repository',
    resourceId: repoId.toString(),
    metadata: { repoName },
    ipAddress,
  })
}

export async function logRepoDisconnected(
  userId: string,
  teamId: number,
  repoId: number,
  repoName: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'repo.disconnected',
    resourceType: 'repository',
    resourceId: repoId.toString(),
    metadata: { repoName },
    ipAddress,
  })
}

export async function logFixApplied(
  userId: string,
  teamId: number,
  repoId: number,
  fixDescription: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'fix.applied',
    resourceType: 'pipeline',
    resourceId: repoId.toString(),
    metadata: { repoId, fixDescription },
    ipAddress,
  })
}

export async function getTeamAuditLogs(
  teamId: number,
  options: {
    limit?: number
    offset?: number
    userId?: string
    action?: string
    startDate?: Date
    endDate?: Date
  } = {}
) {
  const { limit = 50, offset = 0, userId, action, startDate, endDate } = options

  const conditions = [eq(auditLogs.teamId, teamId)]
  
  if (userId) {
    conditions.push(eq(auditLogs.userId, userId))
  }
  if (action) {
    conditions.push(eq(auditLogs.action, action))
  }
  if (startDate) {
    conditions.push(gte(auditLogs.createdAt, startDate))
  }
  if (endDate) {
    conditions.push(lte(auditLogs.createdAt, endDate))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const logs = await db
    .select({
      id: auditLogs.id,
      teamId: auditLogs.teamId,
      userId: auditLogs.userId,
      action: auditLogs.action,
      resourceType: auditLogs.resourceType,
      resourceId: auditLogs.resourceId,
      metadata: auditLogs.metadata,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
      team: {
        id: teams.id,
        name: teams.name,
      },
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.clerkId))
    .leftJoin(teams, eq(auditLogs.teamId, teams.id))
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset)

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(auditLogs)
    .where(where)

  return {
    logs,
    totalCount,
    hasMore: offset + logs.length < totalCount,
  }
}
