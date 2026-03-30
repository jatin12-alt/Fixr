import { NextRequest, NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Check if Prisma client is available
    const { db } = await import('@/lib/db')
    
    // Try a simple database operation
    await db.execute(sql`SELECT 1`)
    
    return NextResponse.json({ 
      status: 'connected',
      message: 'Database is properly configured and connected' 
    })
  } catch (error) {
    console.error('Database check failed:', error)
    
    return NextResponse.json({ 
      status: 'error',
      message: 'Database not configured. Please run: npm install @prisma/client && npm run db:prisma:generate',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
