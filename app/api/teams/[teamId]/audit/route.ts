import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getTeamAuditLogs } from '@/lib/audit'

export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = params
  const { searchParams } = new URL(req.url)
  
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const actionFilter = searchParams.get('action')
  const userFilter = searchParams.get('user')
  const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
  const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

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

    // Get audit logs
    const { logs, totalCount, hasMore } = await getTeamAuditLogs(teamId, {
      limit,
      offset,
      userId: userFilter,
      action: actionFilter,
      startDate,
      endDate,
    })

    return Response.json({
      logs,
      totalCount,
      hasMore,
      pagination: {
        limit,
        offset,
        hasMore,
      },
    })
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return Response.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
