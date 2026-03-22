import { db } from '@/lib/db'
import { AuditLog, TeamMember } from '@prisma/client'

interface CreateAuditLogData {
  teamId?: string
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
}

export async function createAuditLog(data: CreateAuditLogData): Promise<AuditLog> {
  try {
    const auditLog = await db.auditLog.create({
      data: {
        teamId: data.teamId,
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return auditLog
  } catch (error) {
    console.error('Failed to create audit log:', error)
    throw error
  }
}

// Specific audit log helpers
export async function logTeamCreated(
  userId: string,
  teamId: string,
  teamName: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'team.created',
    resourceType: 'team',
    resourceId: teamId,
    metadata: { teamName },
    ipAddress,
  })
}

export async function logMemberInvited(
  userId: string,
  teamId: string,
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
  teamId: string,
  inviteId: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'member.joined',
    resourceType: 'member',
    resourceId: userId,
    metadata: { inviteId },
    ipAddress,
  })
}

export async function logMemberRemoved(
  userId: string,
  teamId: string,
  removedUserId: string,
  removedUserName: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'member.removed',
    resourceType: 'member',
    resourceId: removedUserId,
    metadata: { removedUserId, removedUserName },
    ipAddress,
  })
}

export async function logRoleChanged(
  userId: string,
  teamId: string,
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
    resourceId: targetUserId,
    metadata: { targetUserId, oldRole, newRole },
    ipAddress,
  })
}

export async function logRepoConnected(
  userId: string,
  teamId: string,
  repoId: string,
  repoName: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'repo.connected',
    resourceType: 'repository',
    resourceId: repoId,
    metadata: { repoName },
    ipAddress,
  })
}

export async function logRepoDisconnected(
  userId: string,
  teamId: string,
  repoId: string,
  repoName: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'repo.disconnected',
    resourceType: 'repository',
    resourceId: repoId,
    metadata: { repoName },
    ipAddress,
  })
}

export async function logFixApplied(
  userId: string,
  teamId: string,
  repoId: string,
  fixDescription: string,
  ipAddress?: string
) {
  return createAuditLog({
    teamId,
    userId,
    action: 'fix.applied',
    resourceType: 'pipeline',
    resourceId: repoId,
    metadata: { repoId, fixDescription },
    ipAddress,
  })
}

export async function getTeamAuditLogs(
  teamId: string,
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

  const where = {
    teamId,
    ...(userId && { userId }),
    ...(action && { action }),
    ...(startDate && { createdAt: { gte: startDate } }),
    ...(endDate && { createdAt: { lte: endDate } }),
  }

  const [logs, totalCount] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    db.auditLog.count({ where }),
  ])

  return {
    logs,
    totalCount,
    hasMore: offset + logs.length < totalCount,
  }
}
