import { db, githubTokens, users } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { encryptToken, decryptToken, formatEncryptedToken } from '@/lib/crypto/tokens'

export class GitHubTokenService {
  static async storeToken(userId: string, token: string, scope: string): Promise<void> {
    try {
      // Get user ID
      const user = await db
        .select()
        .from(users)
        .where(eq(users.authId, userId))
        .limit(1)
      
      if (user.length === 0) {
        throw new Error('User not found')
      }

      // Encrypt token
      const encryptedData = encryptToken(token)
      const encryptedToken = formatEncryptedToken(encryptedData)
      
      // Calculate expiry (GitHub tokens don't expire, but we'll refresh periodically)
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 30) // 30 days

      // Delete existing tokens
      await db
        .delete(githubTokens)
        .where(eq(githubTokens.userId, user[0].authId))

      // Store new token
      await db
        .insert(githubTokens)
        .values({
          userId: user[0].authId,
          encryptedToken,
          tokenExpiry: expiry,
          scope,
        })

      console.log(`✅ GitHub token stored for user ${userId}`)
    } catch (error) {
      console.error('❌ Failed to store GitHub token:', error)
      throw error
    }
  }

  static async getToken(userId: string): Promise<string | null> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.authId, userId))
        .limit(1)
      
      if (user.length === 0) {
        return null
      }

      const tokenRecord = await db
        .select()
        .from(githubTokens)
        .where(eq(githubTokens.userId, user[0].authId))
        .limit(1)

      if (tokenRecord.length === 0) {
        return null
      }

      const record = tokenRecord[0]
      
      // Check if token is expired
      if (record.tokenExpiry && new Date() > record.tokenExpiry) {
        console.log('⚠️ GitHub token expired, removing')
        await db
          .delete(githubTokens)
          .where(eq(githubTokens.id, record.id))
        return null
      }

      // Update last used timestamp
      await db
        .update(githubTokens)
        .set({ lastUsed: new Date() })
        .where(eq(githubTokens.id, record.id))

      // Decrypt and return token
      const decryptedToken = decryptToken(record.encryptedToken)
      return decryptedToken
    } catch (error) {
      console.error('❌ Failed to retrieve GitHub token:', error)
      return null
    }
  }

  static async getTokenByDatabaseUserId(databaseUserId: number): Promise<string | null> {
    try {
      const tokenRecord = await db
        .select()
        .from(githubTokens)
        .where(eq(githubTokens.userId, String(databaseUserId)))
        .limit(1)

      if (tokenRecord.length === 0) {
        return null
      }

      const record = tokenRecord[0]
      
      if (record.tokenExpiry && new Date() > record.tokenExpiry) {
        await db
          .delete(githubTokens)
          .where(eq(githubTokens.id, record.id))
        return null
      }

      await db
        .update(githubTokens)
        .set({ lastUsed: new Date() })
        .where(eq(githubTokens.id, record.id))

      return decryptToken(record.encryptedToken)
    } catch (error) {
      console.error('❌ Failed to retrieve GitHub token:', error)
      return null
    }
  }

  static async removeToken(userId: string): Promise<void> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.authId, userId))
        .limit(1)
      
      if (user.length === 0) {
        return
      }

      await db
        .delete(githubTokens)
        .where(eq(githubTokens.userId, user[0].authId))

      console.log(`🗑️ GitHub token removed for user ${userId}`)
    } catch (error) {
      console.error('❌ Failed to remove GitHub token:', error)
    }
  }
}
