import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { hasPermission, canManageRole, canRemoveMember } from '@/lib/permissions'
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
    })

    if (!membership) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get all team members
    const members = await db.teamMember.findMany({
      where: { teamId },
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
    })

    return Response.json(members)
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return Response.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { email, role = 'MEMBER' } = body

    if (!email) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user has permission to invite members
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (!membership || !hasPermission(membership.role, 'canInviteMembers')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if trying to invite someone with equal or higher role
    if (!canManageRole(membership.role, role as TeamRole)) {
      return Response.json(
        { error: 'Cannot invite members with equal or higher role' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = await db.teamMember.findFirst({
      where: {
        teamId,
        user: { email },
      },
    })

    if (existingMember) {
      return Response.json(
        { error: 'User is already a team member' },
        { status: 409 }
      )
    }

    // Check if there's already a pending invite
    const existingInvite = await db.teamInvite.findFirst({
      where: {
        teamId,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvite) {
      return Response.json(
        { error: 'Invite already sent' },
        { status: 409 }
      )
    }

    // Create invite
    const invite = await db.teamInvite.create({
      data: {
        teamId,
        email,
        role: role as TeamRole,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        team: {
          select: {
            name: true,
          },
        },
      },
    })

    // Log member invitation
    await createAuditLog({
      teamId,
      userId,
      action: 'member.invited',
      resourceType: 'member',
      metadata: { inviteeEmail: email, role },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    // TODO: Send invitation email
    // await sendTeamInviteEmail(email, invite.token, invite.team.name)

    return Response.json(invite, { status: 201 })
  } catch (error) {
    console.error('Failed to invite member:', error)
    return Response.json(
      { error: 'Failed to invite member' },
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
    const { memberUserId, newRole } = body

    if (!memberUserId || !newRole) {
      return Response.json(
        { error: 'Member ID and new role are required' },
        { status: 400 }
      )
    }

    // Check if user has permission to manage roles
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (!membership || !hasPermission(membership.role, 'canRemoveMembers')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get target member
    const targetMember = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    })

    if (!targetMember) {
      return Response.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if can manage this member's role
    if (!canManageRole(membership.role, targetMember.role) || 
        !canManageRole(membership.role, newRole as TeamRole)) {
      return Response.json(
        { error: 'Cannot manage roles equal or higher than yours' },
        { status: 403 }
      )
    }

    // Update member role
    const updatedMember = await db.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
      data: {
        role: newRole as TeamRole,
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

    // Log role change
    await createAuditLog({
      teamId,
      userId,
      action: 'member.role_changed',
      resourceType: 'member',
      resourceId: memberUserId,
      metadata: { 
        targetUserId: memberUserId,
        oldRole: targetMember.role,
        newRole 
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return Response.json(updatedMember)
  } catch (error) {
    console.error('Failed to update member role:', error)
    return Response.json(
      { error: 'Failed to update member role' },
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
  const { searchParams } = new URL(req.url)
  const memberUserId = searchParams.get('memberId')

  if (!memberUserId) {
    return Response.json(
      { error: 'Member ID is required' },
      { status: 400 }
    )
  }

  try {
    // Check if user has permission to remove members
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (!membership || !hasPermission(membership.role, 'canRemoveMembers')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get target member
    const targetMember = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!targetMember) {
      return Response.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if can remove this member
    if (!canRemoveMember(membership.role, targetMember.role)) {
      return Response.json(
        { error: 'Cannot remove members with equal or higher role' },
        { status: 403 }
      )
    }

    // Remove member
    await db.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: memberUserId,
        },
      },
    })

    // Log member removal
    await createAuditLog({
      teamId,
      userId,
      action: 'member.removed',
      resourceType: 'member',
      resourceId: memberUserId,
      metadata: { 
        removedUserId: memberUserId,
        removedUserName: targetMember.user.name || 'Unknown',
      },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to remove member:', error)
    return Response.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}
