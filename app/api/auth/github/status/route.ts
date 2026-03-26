import { auth } from '@clerk/nextjs/server'
import { db, users, githubTokens } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  const { userId } = auth()
  
  console.log("Status check for user:", userId)
  
  if (!userId) {
    console.log("Status check: No userId found")
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log("Status check: Querying githubTokens for userId:", userId)
    
    // Check if user has GitHub tokens
    const userTokens = await db
      .select()
      .from(githubTokens)
      .where(eq(githubTokens.userId, userId))
      .limit(1)

    console.log("Status check: Found tokens:", userTokens.length, "records")
    if (userTokens.length > 0) {
      console.log("Status check: Token record:", {
        id: userTokens[0].id,
        hasToken: !!userTokens[0].encryptedToken,
        scope: userTokens[0].scope,
        createdAt: userTokens[0].createdAt
      })
    }

    // Get user info for GitHub username
    const userInfo = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    console.log("Status check: User info:", userInfo.length, "records")

    const connected = userTokens.length > 0 && !!userTokens[0].encryptedToken
    const githubUsername = userInfo.length > 0 ? userInfo[0].githubUsername : undefined

    console.log("Status check: Final result:", { connected, githubUsername })

    return Response.json({
      connected,
      githubUsername
    })
  } catch (error) {
    console.error('GitHub status error:', error)
    return Response.json({ error: 'Failed to check GitHub status' }, { status: 500 })
  }
}
