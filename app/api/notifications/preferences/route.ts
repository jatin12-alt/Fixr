import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const preferences = await db.notificationPreferences.findUnique({
      where: { userId },
    })

    return Response.json(preferences || {
      emailOnFailure: true,
      emailOnFix: true,
      weeklyDigest: false,
      pushEnabled: false,
    })
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error)
    return Response.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { emailOnFailure, emailOnFix, weeklyDigest, pushEnabled } = body

    await db.notificationPreferences.upsert({
      where: { userId },
      update: {
        emailOnFailure,
        emailOnFix,
        weeklyDigest,
        pushEnabled,
      },
      create: {
        userId,
        emailOnFailure,
        emailOnFix,
        weeklyDigest,
        pushEnabled,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to update notification preferences:', error)
    return Response.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
