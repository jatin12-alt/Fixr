import { adminAuth } from './firebase-admin'
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { cookies as nextCookies } from 'next/headers'

export async function getAuth(req?: NextRequest) {
  // Try Authorization header first
  let authHeader = req ? req.headers.get('Authorization') : (await headers()).get('Authorization')
  let idToken: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    idToken = authHeader.split('Bearer ')[1]
  } else {
    // Try firebase_token cookie as fallback (essential for SSE / EventSource)
    try {
      const cookieStore = await nextCookies()
      idToken = req ? req.cookies.get('firebase_token')?.value || null : cookieStore.get('firebase_token')?.value || null
    } catch (error) {
      console.log('Could not access cookies:', error)
      idToken = req ? req.cookies.get('firebase_token')?.value || null : null
    }
  }
  
  if (!idToken) {
    console.log('No auth token found in header or cookie')
    return { userId: null, error: 'Unauthorized' }
  }

  try {
    // Check if adminAuth is properly initialized
    if (!adminAuth || typeof adminAuth.verifyIdToken !== 'function') {
      console.log('Firebase Admin not properly initialized, using fallback')
      return { userId: null, error: 'Firebase Admin not configured' }
    }
    
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    console.log('Token verified successfully for user:', decodedToken.uid)
    return { userId: decodedToken.uid, user: decodedToken, error: null }
  } catch (error) {
    console.error('Firebase Auth Error:', error)
    // If it's a development environment and Firebase Admin is not set up, provide a mock user
    if (process.env.NODE_ENV === 'development' && error instanceof Error && error.message.includes('Firebase Admin')) {
      console.log('Development mode: Using mock authentication')
      return { userId: 'dev-user', user: { uid: 'dev-user', email: 'dev@example.com' }, error: null }
    }
    return { userId: null, error: 'Invalid token' }
  }
}
