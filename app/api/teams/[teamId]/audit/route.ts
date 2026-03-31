import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, teamMembers } from '@/lib/db'
import { getTeamAuditLogs } from '@/lib/audit'
import { eq, and } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { teamId } = await params
  const { searchParams } = new URL(req.url)
  
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const actionFilter = searchParams.get('action')
  const userFilter = searchParams.get('user')
  const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
  const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

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

    // Get audit logs
    const { logs, totalCount, hasMore } = await getTeamAuditLogs(parseInt(teamId), {
      limit,
      offset,
      userId: userFilter || undefined,
      action: actionFilter || undefined,
      startDate,
      endDate,
    })

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
