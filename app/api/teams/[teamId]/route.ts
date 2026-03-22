import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { hasPermission, canManageRole } from '@/lib/permissions'
import { TeamRole } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = params

  try {
    // Check if user is a member of the team
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
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
    })

    if (!membership) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get team details with members and repositories
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
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
          orderBy: { joinedAt: 'asc' },
        },
        repositories: {
          select: {
            id: true,
            name: true,
            fullName: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            members: true,
            repositories: true,
          },
        },
      },
    })

    if (!team) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    // Add user's role and permissions
    const teamWithUserRole = {
      ...team,
      userRole: membership.role,
      userPermissions: {
        canManageTeam: hasPermission(membership.role, 'canManageTeam'),
        canInviteMembers: hasPermission(membership.role, 'canInviteMembers'),
        canRemoveMembers: hasPermission(membership.role, 'canRemoveMembers'),
        canManageRepos: hasPermission(membership.role, 'canManageRepos'),
        canViewAnalytics: hasPermission(membership.role, 'canViewAnalytics'),
        canManageSettings: hasPermission(membership.role, 'canManageSettings'),
        canViewAuditLogs: hasPermission(membership.role, 'canViewAuditLogs'),
      },
    }

    return Response.json(teamWithUserRole)
  } catch (error) {
    console.error('Failed to fetch team:', error)
    return Response.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = params

  try {
    const body = await req.json()
    const { name, avatarUrl } = body

    // Check if user has permission to manage team settings
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (!membership || !hasPermission(membership.role, 'canManageSettings')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update team
    const team = await db.team.update({
      where: { id: teamId },
      data: {
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    })

    // Log team update
    await createAuditLog({
      teamId,
      userId,
      action: 'team.updated',
      resourceType: 'team',
      resourceId: teamId,
      metadata: { updatedFields: Object.keys(body) },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return Response.json(team)
  } catch (error) {
    console.error('Failed to update team:', error)
    return Response.json(
      { error: 'Failed to update team' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = params

  try {
    // Check if user is the team owner
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (!membership || membership.role !== 'OWNER') {
      return Response.json({ error: 'Only team owners can delete teams' }, { status: 403 })
    }

    // Delete team (cascade delete will handle members, invites, etc.)
    await db.team.delete({
      where: { id: teamId },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete team:', error)
    return Response.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    )
  }
}
