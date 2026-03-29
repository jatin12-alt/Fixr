import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, users, repos } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { createWebhook } from '@/lib/github/api'
import { secureAPIRoute } from '@/lib/middleware/security'
import { apiRateLimit } from '@/lib/middleware/rate-limit'

const postHandler = secureAPIRoute(
  async (req: NextRequest) => {
    const { userId } = auth()
    
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
      let user = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1)
      
      if (user.length === 0) {
        // Fallback: If user isn't in DB (due to missing webhook event), dynamically insert them now
        const { currentUser } = await import('@clerk/nextjs/server')
        const clerkUser = await currentUser()
        const email = clerkUser?.primaryEmailAddress?.emailAddress || 
                      clerkUser?.emailAddresses?.[0]?.emailAddress || 
                      'unknown@example.com'

        const [newUser] = await db
          .insert(users)
          .values({
            clerkId: userId,
            email: email,
          })
          .returning()
        
        user = [newUser]
      }

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
          userId: user[0].clerkId,
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
