import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db, githubTokens } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stored GitHub token
    const tokenRecord = await db
      .select()
      .from(githubTokens)
      .where(eq(githubTokens.userId, userId))
      .limit(1)

    if (!tokenRecord.length || !tokenRecord[0].encryptedToken) {
      return NextResponse.json(
        { error: 'GitHub not connected', connected: false },
        { status: 401 }
      )
    }

    const accessToken = tokenRecord[0].encryptedToken

    // Fetch repos from GitHub
    const reposResponse = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=100',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!reposResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repos from GitHub' },
        { status: 500 }
      )
    }

    const githubRepos = await reposResponse.json()

    return NextResponse.json({
      connected: true,
      repos: githubRepos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        private: repo.private,
        language: repo.language,
        stars: repo.stargazers_count,
        updatedAt: repo.updated_at,
        defaultBranch: repo.default_branch,
      })),
    })
  } catch (error) {
    console.error('GitHub repos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
