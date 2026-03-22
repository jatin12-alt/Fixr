import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // GitHub OAuth parameters
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
  const scope = 'repo,workflow,admin:repo_hook'
  const state = userId // Use Clerk userId as state for security
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code`
  
  return redirect(githubAuthUrl)
}
