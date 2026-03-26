import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { hasPermission } from '@/lib/permissions'
import { TeamRole, teams, teamMembers, users, repos } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's clerk ID to find their database user ID
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all teams where user is a member
    const userTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        slug: teams.slug,
        avatarUrl: teams.avatarUrl,
        createdBy: teams.createdBy,
        createdAt: teams.createdAt,
        memberRole: teamMembers.role,
        memberJoinedAt: teamMembers.joinedAt,
      })
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, user.id))
      .orderBy(teams.createdAt)

    // Group by team and add user role info
    const teamMap = new Map()
    
    userTeams.forEach(row => {
      if (!teamMap.has(row.id)) {
        teamMap.set(row.id, {
          id: row.id,
          name: row.name,
          slug: row.slug,
          avatarUrl: row.avatarUrl,
          createdBy: row.createdBy,
          createdAt: row.createdAt,
          members: [],
          repositories: [],
          _count: {
            members: 0,
            repositories: 0,
          },
          userRole: row.memberRole,
          userJoinedAt: row.memberJoinedAt,
        })
      }
    })

    return Response.json(Array.from(teamMap.values()))
  } catch (error) {
    console.error('Failed to fetch teams:', error)
    return Response.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, slug } = body

    if (!name || !slug) {
      return Response.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return Response.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Get user's clerk ID to find their database user ID
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId))
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if slug is already taken
    const [existingTeam] = await db.select().from(teams).where(eq(teams.slug, slug))

    if (existingTeam) {
      return Response.json(
        { error: 'Team slug is already taken' },
        { status: 409 }
      )
    }

    // Create team
    const [newTeam] = await db.insert(teams).values({
      name,
      slug,
      createdBy: user.id,
    }).returning()

    // Add creator as owner
    await db.insert(teamMembers).values({
      teamId: newTeam.id,
      userId: user.id,
      role: 'OWNER',
    })

    // Log team creation
    await createAuditLog({
      teamId: newTeam.id,
      userId: user.id,
      action: 'team.created',
      resourceType: 'team',
      resourceId: newTeam.id.toString(),
      metadata: { teamName: name },
    })

    return Response.json({
      ...newTeam,
      userRole: 'OWNER',
      userJoinedAt: new Date(),
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create team:', error)
    return Response.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}
