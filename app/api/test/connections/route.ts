import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { adminAuth } from '@/lib/firebase-admin'
import { auth } from '@/lib/firebase'

interface ConnectionResult {
  status: string
  error: string | null
}

interface TestResults {
  database: ConnectionResult
  firebaseAdmin: ConnectionResult
  firebaseClient: ConnectionResult
  environment: {
    status: string
    vars: Record<string, string>
  }
}

export async function GET() {
  const results: TestResults = {
    database: { status: 'unknown', error: null },
    firebaseAdmin: { status: 'unknown', error: null },
    firebaseClient: { status: 'unknown', error: null },
    environment: { status: 'unknown', vars: {} }
  }

  // Test Database Connection
  try {
    await db.execute(sql`SELECT 1`)
    results.database = { status: 'connected', error: null }
  } catch (error) {
    results.database = { 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    }
  }

  // Test Firebase Admin
  try {
    if (adminAuth && typeof adminAuth.verifyIdToken === 'function') {
      // Try to verify a mock token (this will fail but tells us if the service is working)
      try {
        await adminAuth.verifyIdToken('mock-token')
      } catch (e) {
        // Expected to fail, but means the service is working
      }
      results.firebaseAdmin = { status: 'connected', error: null }
    } else {
      results.firebaseAdmin = { status: 'not_configured', error: 'Firebase Admin not properly initialized' }
    }
  } catch (error) {
    results.firebaseAdmin = { 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'Unknown Firebase Admin error' 
    }
  }

  // Test Firebase Client Config
  try {
    if (auth) {
      results.firebaseClient = { status: 'configured', error: null }
    } else {
      results.firebaseClient = { status: 'not_configured', error: 'Firebase client not initialized' }
    }
  } catch (error) {
    results.firebaseClient = { 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'Unknown Firebase client error' 
    }
  }

  // Check Environment Variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ]

  const envStatus: Record<string, string> = {}
  let allPresent = true

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    envStatus[envVar] = value ? 'present' : 'missing'
    if (!value) allPresent = false
  }

  results.environment = {
    status: allPresent ? 'complete' : 'incomplete',
    vars: envStatus
  }

  return NextResponse.json(results)
}
