import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, users, repos } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const repoId = parseInt(id)
    
    if (isNaN(repoId)) {
      return Response.json({ error: 'Invalid repository ID' }, { status: 400 })
    }

    const { autoMode, isActive, autoFixEnabled } = await req.json()

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)
    
    if (user.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 })
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
      return Response.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update repository
    const result = await db
      .update(repos)
      .set(updateData)
      .where(and(eq(repos.id, repoId), eq(repos.userId, userId)))
      .returning()

    if (result.length === 0) {
      return Response.json({ error: 'Repository not found' }, { status: 404 })
    }

    return Response.json({ success: true, repo: result[0] })
  } catch (error) {
    console.error('Repository settings API error:', error)
    return Response.json({ error: 'Failed to update repository settings' }, { status: 500 })
  }
}
