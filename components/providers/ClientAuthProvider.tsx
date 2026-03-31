'use client'

import { FirebaseAuthProvider } from '@/lib/providers/FirebaseAuthProvider'

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  )
}
