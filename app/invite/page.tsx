'use client'

import { Suspense } from 'react'
import InvitePageContent from './invite-content'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading invitation...</p>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InvitePageContent />
    </Suspense>
  )
}
