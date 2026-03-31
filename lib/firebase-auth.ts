import { auth } from '@/lib/firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
} from 'firebase/auth'

export async function signInWithGoogle(): Promise<string> {
  try {
    const provider = new GoogleAuthProvider()
    provider.addScope('profile')
    provider.addScope('email')

    const result = await signInWithPopup(auth, provider)
    const idToken = await result.user.getIdToken()
    return idToken
  } catch (error: any) {
    console.error('Google sign-in error:', error)
    throw error
  }
}

export async function signInWithGithubProvider(): Promise<string> {
  try {
    const provider = new GithubAuthProvider()
    provider.addScope('user:email')

    const result = await signInWithPopup(auth, provider)
    const idToken = await result.user.getIdToken()
    return idToken
  } catch (error: any) {
    console.error('GitHub sign-in error:', error)
    throw error
  }
}
