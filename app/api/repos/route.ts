import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { repos, githubTokens } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRepos = await db
      .select()
      .from(repos)
      .where(eq(repos.userId, userId))

    return NextResponse.json({
      repos: userRepos.map(repo => ({
        id: repo.id,
        githubRepoId: repo.githubId,
        name: repo.name,
        fullName: repo.fullName,
        url: `https://github.com/${repo.fullName}`,
        isActive: repo.isActive,
        autoMode: repo.autoMode,
        autoFixEnabled: repo.autoFixEnabled,
        healthStatus: repo.healthStatus,
        lastScanAt: repo.lastScanAt,
        createdAt: repo.createdAt,
      }))
    })
  } catch (error) {
    console.error('Repos API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { githubRepoId, name, fullName, url, language, private: isPrivate } = body

    if (!githubRepoId || !name || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if repo already exists
    const existing = await db
      .select()
      .from(repos)
      .where(eq(repos.githubId, githubRepoId))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Repository already monitored' },
        { status: 409 }
      )
    }

    // Create new repo entry
    const [newRepo] = await db
      .insert(repos)
      .values({
        userId,
        githubId: githubRepoId,
        name,
        fullName,
        isActive: true,
        autoMode: false,
      })
      .returning()

    console.log("🔥 REPO_SAVED:", { repoId: newRepo.id, fullName })

    // 🎣 CREATE GITHUB WEBHOOK
    try {
      console.log("🎣 CREATING_WEBHOOK for repo:", fullName)
      
      // Get GitHub token
      const tokenRecord = await db
        .select()
        .from(githubTokens)
        .where(eq(githubTokens.userId, userId))
        .limit(1)

      if (!tokenRecord.length || !tokenRecord[0].encryptedToken) {
        console.log("⚠️ NO_GITHUB_TOKEN: Skipping webhook creation")
      } else {
        const accessToken = tokenRecord[0].encryptedToken
        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhook/github`
        
        // Create webhook via GitHub API
        const webhookResponse = await fetch(
          `https://api.github.com/repos/${fullName}/hooks`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: 'web',
              active: true,
              events: ['push', 'pull_request', 'workflow_run'],
              config: {
                url: webhookUrl,
                content_type: 'json',
                secret: process.env.GITHUB_WEBHOOK_SECRET || 'fixr-webhook-secret',
              },
            }),
          }
        )

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json()
          console.log("🎣 WEBHOOK_CREATED:", { 
            webhookId: webhookData.id, 
            url: webhookData.config.url 
          })
          
          // Update repo with webhook ID
          await db
            .update(repos)
            .set({ webhookId: webhookData.id.toString() })
            .where(eq(repos.id, newRepo.id))
            
          console.log("🔥 REPO_UPDATED_WITH_WEBHOOK_ID")
        } else {
          const webhookError = await webhookResponse.text()
          console.error("🎣 WEBHOOK_CREATE_FAILED:", webhookResponse.status, webhookError)
        }
      }
    } catch (webhookError) {
      console.error("🎣 WEBHOOK_ERROR:", webhookError)
      // Don't fail the whole request if webhook creation fails
    }

    return NextResponse.json({
      success: true,
      repo: {
        id: newRepo.id,
        githubRepoId: newRepo.githubId,
        name: newRepo.name,
        fullName: newRepo.fullName,
        url: `https://github.com/${newRepo.fullName}`,
        isActive: newRepo.isActive,
        autoMode: newRepo.autoMode,
        autoFixEnabled: newRepo.autoFixEnabled,
        healthStatus: newRepo.healthStatus,
        lastScanAt: newRepo.lastScanAt,
        createdAt: newRepo.createdAt,
      }
    })
  } catch (error) {
    console.error('Add repo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
