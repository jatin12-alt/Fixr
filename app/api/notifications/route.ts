import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, notifications } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseInt(
      request.nextUrl.searchParams.get('limit') || '50'
    )

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)

    const unreadCount = userNotifications.filter(n => !n.read).length

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
