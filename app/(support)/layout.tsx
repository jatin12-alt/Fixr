import { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function SupportLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="bg-transparent text-gray-300">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  )
}
