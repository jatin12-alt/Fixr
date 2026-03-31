import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await getAuth(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { uid, email, displayName } = await req.json()

    if (uid !== userId) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 403 })
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.authId, uid))
      .limit(1)

    if (existingUser.length === 0) {
      // Create new user
      await db.insert(users).values({
        authId: uid,
        email: email || '',
        name: displayName || null,
      })
    } else {
      // Update existing user
      await db
        .update(users)
        .set({
          email: email || existingUser[0].email,
          name: displayName || existingUser[0].name,
        })
        .where(eq(users.authId, uid))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sync user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
