import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'

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

    // Get pending invites
    const invites = await db.teamInvite.findMany({
      where: {
        teamId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        team: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json(invites)
  } catch (error) {
    console.error('Failed to fetch team invites:', error)
    return Response.json(
      { error: 'Failed to fetch team invites' },
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

    if (!membership) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
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
        role,
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

    // Log invitation
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
    console.error('Failed to create invite:', error)
    return Response.json(
      { error: 'Failed to create invite' },
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
  const inviteId = searchParams.get('inviteId')

  if (!inviteId) {
    return Response.json(
      { error: 'Invite ID is required' },
      { status: 400 }
    )
  }

  try {
    // Check if user has permission to manage invites
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

    // Get and delete invite
    const invite = await db.teamInvite.findFirst({
      where: {
        id: inviteId,
        teamId,
      },
    })

    if (!invite) {
      return Response.json({ error: 'Invite not found' }, { status: 404 })
    }

    await db.teamInvite.delete({
      where: { id: inviteId },
    })

    // Log invite cancellation
    await createAuditLog({
      teamId,
      userId,
      action: 'invite.cancelled',
      resourceType: 'member',
      metadata: { inviteeEmail: invite.email, role: invite.role },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to cancel invite:', error)
    return Response.json(
      { error: 'Failed to cancel invite' },
      { status: 500 }
    )
  }
}
