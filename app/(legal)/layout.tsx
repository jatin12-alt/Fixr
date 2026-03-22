import { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function LegalLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-gray-300">
      <Navbar />
      
      {/* Subtle top border accent */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
      
      <Footer />
    </div>
  )
}
