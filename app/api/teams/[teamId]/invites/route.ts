import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db, teamMembers, teamInvites, teams } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { eq, and, gt, desc, isNull } from 'drizzle-orm'

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
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get pending invites
    const invites = await db
      .select({
        id: teamInvites.id,
        teamId: teamInvites.teamId,
        email: teamInvites.email,
        role: teamInvites.role,
        token: teamInvites.token,
        expiresAt: teamInvites.expiresAt,
        acceptedAt: teamInvites.acceptedAt,
        createdAt: teamInvites.createdAt,
        team: {
          name: teams.name,
        },
      })
      .from(teamInvites)
      .leftJoin(teams, eq(teamInvites.teamId, teams.id))
      .where(
        and(
          eq(teamInvites.teamId, parseInt(teamId)),
          isNull(teamInvites.acceptedAt),
          gt(teamInvites.expiresAt, new Date())
        )
      )
      .orderBy(desc(teamInvites.createdAt))

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
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params

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
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
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
      return Response.json(
        { error: 'Invite already sent' },
        { status: 409 }
      )
    }

    // Create invite
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const [invite] = await db.insert(teamInvites).values({
      teamId: parseInt(teamId),
      email,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }).returning({
      id: teamInvites.id,
      teamId: teamInvites.teamId,
      email: teamInvites.email,
      role: teamInvites.role,
      token: teamInvites.token,
      expiresAt: teamInvites.expiresAt,
      acceptedAt: teamInvites.acceptedAt,
      createdAt: teamInvites.createdAt,
    })

    // Log invitation
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
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params
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
    const membership = await db.select().from(teamMembers).where(
      and(
        eq(teamMembers.teamId, parseInt(teamId)),
        eq(teamMembers.userId, userId)
      )
    ).limit(1)

    if (!membership || membership.length === 0) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    // Get and delete invite
    const invite = await db.select().from(teamInvites).where(
      and(
        eq(teamInvites.id, parseInt(inviteId)),
        eq(teamInvites.teamId, parseInt(teamId))
      )
    ).limit(1)

    if (!invite || invite.length === 0) {
      return Response.json({ error: 'Invite not found' }, { status: 404 })
    }

    await db.delete(teamInvites).where(
      and(
        eq(teamInvites.id, parseInt(inviteId)),
        eq(teamInvites.teamId, parseInt(teamId))
      )
    )

    // Log invite cancellation
    await createAuditLog({
      teamId: parseInt(teamId),
      userId: userId,
      action: 'invite.cancelled',
      resourceType: 'member',
      metadata: { inviteeEmail: invite[0].email, role: invite[0].role },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
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
