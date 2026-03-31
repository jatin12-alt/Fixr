import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, teamInvites, teamMembers, teams } from '@/lib/db'
import { eq, and, gt, isNull } from 'drizzle-orm'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
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
      return NextResponse.json({ error: 'Already a team member' }, { status: 409 })
    }

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to fetch invite' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
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
      return NextResponse.json({ error: 'Already a team member' }, { status: 409 })
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    )
  }
}
