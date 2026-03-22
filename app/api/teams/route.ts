import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { hasPermission } from '@/lib/permissions'
import { TeamRole } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all teams where user is a member
    const teams = await db.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
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
        },
        repositories: {
          select: {
            id: true,
            name: true,
            fullName: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            members: true,
            repositories: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Add user's role in each team
    const teamsWithUserRole = teams.map(team => {
      const userMembership = team.members.find(m => m.userId === userId)
      return {
        ...team,
        userRole: userMembership?.role || null,
        userJoinedAt: userMembership?.joinedAt || null,
      }
    })

    return Response.json(teamsWithUserRole)
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

    // Check if slug is already taken
    const existingTeam = await db.team.findUnique({
      where: { slug },
    })

    if (existingTeam) {
      return Response.json(
        { error: 'Team slug is already taken' },
        { status: 409 }
      )
    }

    // Create team
    const team = await db.team.create({
      data: {
        name,
        slug,
        createdBy: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
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
        },
      },
    })

    // Log team creation
    await createAuditLog({
      teamId: team.id,
      userId,
      action: 'team.created',
      resourceType: 'team',
      resourceId: team.id,
      metadata: { teamName: name },
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return Response.json(team, { status: 201 })
  } catch (error) {
    console.error('Failed to create team:', error)
    return Response.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}
