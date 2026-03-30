import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db, teamInvites, teamMembers, teams } from '@/lib/db'
import { eq, and, gt, isNull } from 'drizzle-orm'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await params

  try {
    // Find the invite
    const invite = await db
      .select({
        id: teamInvites.id,
        teamId: teamInvites.teamId,
        email: teamInvites.email,
        role: teamInvites.role,
        token: teamInvites.token,
        expiresAt: teamInvites.expiresAt,
        acceptedAt: teamInvites.acceptedAt,
        team: {
          id: teams.id,
          name: teams.name,
          slug: teams.slug,
        },
      })
      .from(teamInvites)
      .leftJoin(teams, eq(teamInvites.teamId, teams.id))
      .where(
        and(
          eq(teamInvites.token, token),
          isNull(teamInvites.acceptedAt),
          gt(teamInvites.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!invite.length) {
      return Response.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, invite[0].teamId!),
          eq(teamMembers.userId, userId)
        )
      )
      .limit(1)

    if (existingMember.length > 0) {
      return Response.json({ error: 'Already a team member' }, { status: 409 })
    }

    return Response.json({
      team: {
        id: invite[0].team?.id || 0,
        name: invite[0].team?.name || '',
        slug: invite[0].team?.slug || '',
      },
      role: invite[0].role,
      email: invite[0].email,
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
  { params }: { params: Promise<{ token: string }> }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await params

  try {
    // Find and validate the invite
    const invite = await db
      .select({
        id: teamInvites.id,
        teamId: teamInvites.teamId,
        email: teamInvites.email,
        role: teamInvites.role,
        token: teamInvites.token,
        expiresAt: teamInvites.expiresAt,
        acceptedAt: teamInvites.acceptedAt,
        team: {
          id: teams.id,
          name: teams.name,
          slug: teams.slug,
        },
      })
      .from(teamInvites)
      .leftJoin(teams, eq(teamInvites.teamId, teams.id))
      .where(
        and(
          eq(teamInvites.token, token),
          isNull(teamInvites.acceptedAt),
          gt(teamInvites.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!invite.length) {
      return Response.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, invite[0].teamId!),
          eq(teamMembers.userId, userId)
        )
      )
      .limit(1)

    if (existingMember.length > 0) {
      return Response.json({ error: 'Already a team member' }, { status: 409 })
    }

    // Add user to team
    const teamMember = await db.insert(teamMembers).values({
      teamId: invite[0].teamId!,
      userId,
      role: invite[0].role,
    }).returning()

    // Mark invite as accepted
    await db
      .update(teamInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(teamInvites.id, invite[0].id))

    // Log team join
    await createAuditLog({
      teamId: invite[0].teamId!,
      userId: userId,
      action: 'member.joined',
      resourceType: 'member',
      resourceId: userId,
      metadata: { inviteId: invite[0].id },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
    })

    return Response.json({
      success: true,
      teamMember: teamMember[0],
      team: {
        id: invite[0].team?.id || 0,
        name: invite[0].team?.name || '',
        slug: invite[0].team?.slug || '',
      },
    })
  } catch (error) {
    console.error('Failed to accept invite:', error)
    return Response.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    )
  }
}
