import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserRepos } from '@/lib/github/api'
import { GitHubTokenService } from '@/lib/services/github-tokens'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const githubToken = await GitHubTokenService.getToken(userId)
  
  if (!githubToken) {
    return Response.json({ error: 'GitHub not connected' }, { status: 401 })
  }

  try {
    const repos = await getUserRepos(githubToken)
    
    // Filter repos that likely have workflows
    const filteredRepos = repos.filter(repo => 
      !repo.fork && // Not a fork
      !repo.archived && // Not archived
      repo.pushed_at // Has recent activity
    )

    return Response.json(filteredRepos)
  } catch (error) {
    console.error('Failed to fetch repositories:', error)
    return Response.json(
      { error: 'Failed to fetch repositories' }, 
      { status: 500 }
    )
  }
}
