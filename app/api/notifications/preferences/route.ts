import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, notificationPreferences } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const preferences = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1)

    return NextResponse.json(preferences[0] || {
      emailOnFailure: true,
      emailOnFix: true,
      weeklyDigest: false,
      pushEnabled: false,
    })
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { emailOnFailure, emailOnFix, weeklyDigest, pushEnabled } = body

    await db.insert(notificationPreferences).values({
      userId,
      emailOnFailure,
      emailOnFix,
      weeklyDigest,
      pushEnabled,
    }).onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: {
        emailOnFailure,
        emailOnFix,
        weeklyDigest,
        pushEnabled,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
