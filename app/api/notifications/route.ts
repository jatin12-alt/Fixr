import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const unreadOnly = searchParams.get('unreadOnly') === 'true'
  const offset = (page - 1) * limit

  try {
    // Get notifications
    const where = {
      userId,
      ...(unreadOnly && { read: false }),
    }

    const [notifications, totalCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          repoName: true,
          repoId: true,
          read: true,
          createdAt: true,
        },
      }),
      db.notification.count({ where }),
    ])

    // Get unread count
    const unreadCount = await db.notification.count({
      where: { userId, read: false },
    })

    return Response.json({
      notifications,
      unreadCount,
      hasMore: offset + notifications.length < totalCount,
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return Response.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { ids, all } = body

    if (all) {
      // Mark all notifications as read
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      })
    } else if (Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read
      await db.notification.updateMany({
        where: {
          id: { in: ids },
          userId,
        },
        data: { read: true },
      })
    } else {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to update notifications:', error)
    return Response.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
