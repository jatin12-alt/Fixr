import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, teamMembers, teamInvites, users } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { hasPermission, canManageRole, canRemoveMember } from '@/lib/permissions'
import { eq, and, desc, isNull, gt } from 'drizzle-orm'
import type { TeamRole } from '@/lib/db/schema'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params

  try {
    // Check if user is a member of the team
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get all team members
    const members = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        user: {
          id: users.id,
          authId: users.authId,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
          githubUsername: users.githubUsername,
        },
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.authId))
      .where(eq(teamMembers.teamId, parseInt(teamId)))
      .orderBy(desc(teamMembers.joinedAt))

    return NextResponse.json(members)
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params

  try {
    const body = await req.json()
    const { email, role = 'MEMBER' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user has permission to invite members
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0 || !hasPermission(membership[0].role, 'canInviteMembers')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if trying to invite someone with equal or higher role
    if (!canManageRole(membership[0].role, role as TeamRole)) {
      return NextResponse.json(
        { error: 'Cannot invite members with equal or higher role' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.authId))
      .where(
        and(
          eq(teamMembers.teamId, parseInt(teamId)),
          eq(users.email, email)
        )
      )
      .limit(1)

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 409 }
      )
    }

    // Check if there's already a pending invite
    const existingInvite = await db.select().from(teamInvites).where(
      and(
        eq(teamInvites.teamId, parseInt(teamId)),
        eq(teamInvites.email, email),
        isNull(teamInvites.acceptedAt),
        gt(teamInvites.expiresAt, new Date())
      )
    ).limit(1)

    if (existingInvite && existingInvite.length > 0) {
      return NextResponse.json(
        { error: 'Invite already sent' },
        { status: 409 }
      )
    }

    // Create invite
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const [invite] = await db.insert(teamInvites).values({
      teamId: parseInt(teamId),
      email,
      role: role as TeamRole,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }).returning()

    // Log member invitation
    await createAuditLog({
      teamId: parseInt(teamId),
      userId: userId,
      action: 'member.invited',
      resourceType: 'member',
      metadata: { inviteeEmail: email, role },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
    })

    // TODO: Send invitation email
    // await sendTeamInviteEmail(email, invite.token, invite.team.name)

    return NextResponse.json(invite, { status: 201 })
  } catch (error) {
    console.error('Failed to invite member:', error)
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params

  try {
    const body = await req.json()
    const { memberUserId, newRole } = body

    if (!memberUserId || !newRole) {
      return NextResponse.json(
        { error: 'Member ID and new role are required' },
        { status: 400 }
      )
    }

    // Check if user has permission to manage roles
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0 || !hasPermission(membership[0].role, 'canRemoveMembers')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get target member
    const targetMember = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, memberUserId)
      )
    ).limit(1)

    if (!targetMember || targetMember.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if can manage this member's role
    if (!canManageRole(membership[0].role, targetMember[0].role) || 
        !canManageRole(membership[0].role, newRole as TeamRole)) {
      return NextResponse.json(
        { error: 'Cannot manage roles equal or higher than yours' },
        { status: 403 }
      )
    }

    // Update member role
    const [updatedMember] = await db.update(teamMembers)
      .set({ role: newRole as TeamRole })
      .where(
        and(
          eq(teamMembers.teamId, parseInt(teamId)),
          eq(teamMembers.userId, memberUserId)
        )
      )
      .returning()

    // Log role change
    await createAuditLog({
      teamId: parseInt(teamId),
      userId: userId,
      action: 'member.role_changed',
      resourceType: 'member',
      resourceId: memberUserId,
      metadata: { 
        targetUserId: memberUserId,
        oldRole: targetMember[0].role,
        newRole,
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Failed to update member role:', error)
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params
  const { searchParams } = new URL(req.url)
  const memberUserId = searchParams.get('memberId')

  if (!memberUserId) {
    return NextResponse.json(
      { error: 'Member ID is required' },
      { status: 400 }
    )
  }

  try {
    // Check if user has permission to remove members
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0 || !hasPermission(membership[0].role, 'canRemoveMembers')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get target member
    const targetMember = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        user: {
          id: users.id,
          authId: users.authId,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.authId))
      .where(
        and(
          eq(teamMembers.teamId, parseInt(teamId)),
          eq(teamMembers.userId, memberUserId)
        )
      )
      .limit(1)

    if (!targetMember || targetMember.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if can remove this member
    if (!canRemoveMember(membership[0].role, targetMember[0].role)) {
      return NextResponse.json(
        { error: 'Cannot remove members with equal or higher role' },
        { status: 403 }
      )
    }

    // Remove member
    await db.delete(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, memberUserId)
      )
    )

    // Log member removal
    await createAuditLog({
      teamId: parseInt(teamId),
      userId: userId,
      action: 'member.removed',
      resourceType: 'member',
      resourceId: memberUserId,
      metadata: { 
        targetUserId: memberUserId,
        removedUserName: targetMember[0].user?.name || 'Unknown',
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove member:', error)
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}
