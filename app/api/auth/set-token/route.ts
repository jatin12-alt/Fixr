import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Set secure HTTP-only cookie with the Firebase token
    const response = NextResponse.json({ success: true })
    response.cookies.set('firebase_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Set token error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
