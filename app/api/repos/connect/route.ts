import { NextRequest } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, users, repos } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { createWebhook } from '@/lib/github/api'
import { secureAPIRoute } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rate-limit'

const postHandler = secureAPIRoute(
  async (req: NextRequest) => {
    const { userId } = await getAuth(req)
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const githubToken = req.cookies.get('github_token')?.value
    
    if (!githubToken) {
      return Response.json({ error: 'GitHub not connected' }, { status: 401 })
    }

    try {
      const { githubId, name, fullName } = await req.json()

      // Get user from database
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.authId, userId))
        .limit(1)
      
      if (userResult.length === 0) {
        return Response.json({ error: 'User not found. Please sign in again.' }, { status: 404 })
      }
      
      const user = userResult[0]

      // Check if repository already exists
      const existingRepo = await db
        .select()
        .from(repos)
        .where(eq(repos.githubId, githubId))
        .limit(1)
      
      if (existingRepo.length > 0) {
        return Response.json({ error: 'Repository already connected' }, { status: 409 })
      }

      // Create webhook gracefully allowing localhost dev bypassing
      const [owner, repoName] = fullName.split('/')
      let webhookId = 'mock_dev_webhook'
      try {
        webhookId = await createWebhook(githubToken, owner, repoName)
      } catch (e: any) {
        if (process.env.NODE_ENV !== 'production') {
          webhookId = 'mock_dev_webhook'
        } else {
          throw e
        }
      }

      // Save repository to database
      const [newRepo] = await db
        .insert(repos)
        .values({
          userId: user.authId,
          githubId,
          name,
          fullName,
          webhookId,
          isActive: true,
          autoMode: false,
        })
        .returning()

      return Response.json({ 
        success: true, 
        repository: newRepo 
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('webhook')) {
        return Response.json(
          { error: 'Failed to create webhook. Check repository permissions.' }, 
          { status: 403 }
        )
      }
      
      return Response.json(
        { error: 'Failed to connect repository' }, 
        { status: 500 }
      )
    }
  },
  {
    requireAuth: true,
    rateLimit: apiRateLimit,
    validateContentType: true,
  }
)

export { postHandler as POST }
