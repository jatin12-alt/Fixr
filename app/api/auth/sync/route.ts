import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const idToken = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const { uid, email, name, picture } = decodedToken

    // Sync with Neon DB
    const existingUser = await db.select().from(users).where(eq(users.authId, uid)).limit(1)

    if (existingUser.length === 0) {
      await db.insert(users).values({
        authId: uid,
        email: email || '',
        name: name || '',
        avatarUrl: picture || '',
      })
      console.log('User synced to database:', uid)
    } else {
      // Update existing user if needed
      await db.update(users).set({
        email: email || '',
        name: name || '',
        avatarUrl: picture || '',
      }).where(eq(users.authId, uid))
      console.log('User updated in database:', uid)
    }

    return NextResponse.json({ success: true, uid })
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
