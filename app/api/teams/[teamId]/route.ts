import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db, teamMembers, teams, users, repos } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { hasPermission, canManageRole } from '@/lib/permissions'
import { eq, and, desc } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params

  try {
    // Check if user is a member of the team
    const membership = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        user: {
          id: users.id,
          clerkId: users.clerkId,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.clerkId))
      .where(
        and(
          eq(teamMembers.teamId, parseInt(teamId)),
          eq(teamMembers.userId, userId)
        )
      )
      .limit(1)

    if (!membership || membership.length === 0) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get team details
    const [teamData] = await db.select().from(teams).where(eq(teams.id, parseInt(teamId))).limit(1)

    if (!teamData) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get team members
    const members = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        user: {
          id: users.id,
          clerkId: users.clerkId,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.clerkId))
      .where(eq(teamMembers.teamId, parseInt(teamId)))
      .orderBy(teamMembers.joinedAt)

    // Get team repositories
    const repositories = await db
      .select({
        id: repos.id,
        name: repos.name,
        fullName: repos.fullName,
        isActive: repos.isActive,
        createdAt: repos.createdAt,
      })
      .from(repos)
      .where(eq(repos.teamId, parseInt(teamId)))

    // Combine data
    const team = {
      ...teamData,
      members,
      repositories,
      _count: {
        members: members.length,
        repositories: repositories.length,
      },
    }

    // Add user's role and permissions
    const teamWithUserRole = {
      ...team,
      userRole: membership[0].role,
      userPermissions: {
        canManageTeam: hasPermission(membership[0].role, 'canManageTeam'),
        canInviteMembers: hasPermission(membership[0].role, 'canInviteMembers'),
        canRemoveMembers: hasPermission(membership[0].role, 'canRemoveMembers'),
        canManageRepos: hasPermission(membership[0].role, 'canManageRepos'),
        canViewAnalytics: hasPermission(membership[0].role, 'canViewAnalytics'),
        canManageSettings: hasPermission(membership[0].role, 'canManageSettings'),
        canViewAuditLogs: hasPermission(membership[0].role, 'canViewAuditLogs'),
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
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params

  try {
    const body = await req.json()
    const { name, avatarUrl } = body

    // Check if user has permission to manage team settings
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0 || !hasPermission(membership[0].role, 'canManageSettings')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update team
    const [team] = await db.update(teams)
      .set({
        ...(name && { name }),
        ...(avatarUrl !== undefined && avatarUrl !== null && { avatarUrl }),
      })
      .where(eq(teams.id, parseInt(teamId)))
      .returning()

    // Log team update
    await createAuditLog({
      teamId: parseInt(teamId),
      userId: userId,
      action: 'team.updated',
      resourceType: 'team',
      resourceId: teamId,
      metadata: { updatedFields: Object.keys(body) },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
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
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params

  try {
    // Check if user is the team owner
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0 || membership[0].role !== 'OWNER') {
      return Response.json({ error: 'Only team owners can delete teams' }, { status: 403 })
    }

    // Delete team (cascade delete will handle members, invites, etc.)
    await db.delete(teams).where(eq(teams.id, parseInt(teamId)))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete team:', error)
    return Response.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    )
  }
}
