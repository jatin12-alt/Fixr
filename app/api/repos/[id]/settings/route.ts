import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, users, repos } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await getAuth(req)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const repoId = parseInt(id)
    
    if (isNaN(repoId)) {
      return NextResponse.json({ error: 'Invalid repository ID' }, { status: 400 })
    }

    const { autoMode, isActive, autoFixEnabled } = await req.json()

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.authId, userId))
      .limit(1)
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update object
    const updateData: any = {}
    if (typeof autoMode === 'boolean') {
      updateData.autoMode = autoMode
    }
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }
    if (typeof autoFixEnabled === 'boolean') {
      updateData.autoFixEnabled = autoFixEnabled
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update repository
    const result = await db
      .update(repos)
      .set(updateData)
      .where(and(eq(repos.id, repoId), eq(repos.userId, userId)))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, repo: result[0] })
  } catch (error) {
    console.error('Repository settings API error:', error)
    return NextResponse.json({ error: 'Failed to update repository settings' }, { status: 500 })
  }
}
