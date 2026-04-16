import { adminAuth } from './firebase-admin'
import { NextRequest } from 'next/server'
import { headers, cookies as nextCookies } from 'next/headers'

export async function getAuth(req?: NextRequest) {
  let idToken: string | null = null

  // 1. Check Authorization Header
  const authHeader = req ? req.headers.get('Authorization') : (await headers()).get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    idToken = authHeader.split('Bearer ')[1]
  }

  // 2. Fallback to Cookie (Essential for SSE/EventSource)
  if (!idToken) {
    try {
      const cookieStore = await nextCookies()
      idToken = req 
        ? req.cookies.get('firebase_token')?.value || null 
        : cookieStore.get('firebase_token')?.value || null
    } catch (e) {
      // Background context or non-headers context
    }
  }

  if (!idToken) {
    return { userId: null, user: null, error: 'Unauthenticated' }
  }

  try {
    // 3. Verify Token with Admin SDK
    // verifyIdToken automatically checks for expiration.
    // If it throws 'auth/id-token-expired', we catch it below.
    const decodedToken = await adminAuth.verifyIdToken(idToken)

    // 4. (Optional) Check Revocation logic could be added here
    
    return { 
      userId: decodedToken.uid, 
      user: decodedToken, 
      error: null 
    }
  } catch (error: any) {
    console.error('[Sentinel Auth] Verification Failed:', error.code || error.message)

    if (error.code === 'auth/id-token-expired') {
      return { userId: null, user: null, error: 'TOKEN_EXPIRED' }
    }

    // Dev Fallback for local environments without Admin SDK configured
    if (process.env.NODE_ENV === 'development' && (!adminAuth || error.message.includes('credential'))) {
      return { 
        userId: 'dev-user-01', 
        user: { uid: 'dev-user-01', email: 'dev@fixr.io' }, 
        error: null 
      }
    }

    return { userId: null, user: null, error: 'INVALID_TOKEN' }
  }
}
