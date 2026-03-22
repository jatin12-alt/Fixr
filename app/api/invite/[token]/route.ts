import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = params

  try {
    // Find the invite
    const invite = await db.teamInvite.findFirst({
      where: {
        token,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!invite) {
      return Response.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: invite.teamId,
          userId,
        },
      },
    })

    if (existingMember) {
      return Response.json({ error: 'Already a team member' }, { status: 409 })
    }

    return Response.json({
      team: invite.team,
      role: invite.role,
      email: invite.email,
    })
  } catch (error) {
    console.error('Failed to fetch invite:', error)
    return Response.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = params

  try {
    // Find and validate the invite
    const invite = await db.teamInvite.findFirst({
      where: {
        token,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        team: true,
      },
    })

    if (!invite) {
      return Response.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: invite.teamId,
          userId,
        },
      },
    })

    if (existingMember) {
      return Response.json({ error: 'Already a team member' }, { status: 409 })
    }

    // Add user to team
    const teamMember = await db.teamMember.create({
      data: {
        teamId: invite.teamId,
        userId,
        role: invite.role,
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
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    // Mark invite as accepted
    await db.teamInvite.update({
      where: { id: invite.id },
      data: {
        acceptedAt: new Date(),
      },
    })

    // Log team join
    await createAuditLog({
      teamId: invite.teamId,
      userId,
      action: 'member.joined',
      resourceType: 'member',
      resourceId: userId,
      metadata: { inviteId: invite.id },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return Response.json({
      success: true,
      teamMember,
      team: invite.team,
    })
  } catch (error) {
    console.error('Failed to accept invite:', error)
    return Response.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    )
  }
}
