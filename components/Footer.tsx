'use client'

import Link from 'next/link'
import { Github, Linkedin, Twitter, Mail, ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const navigation = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Reviews', href: '/reviews' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
    support: [
      { name: 'Help', href: '/help' },
      { name: 'Contact', href: '/contact' },
      { name: 'Status', href: '/status' },
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Security', href: '/security' },
      { name: 'Cookies', href: '/cookies' },
    ],
  }

  return (
    <>
      <footer className="bg-[rgba(5,5,8,0.95)] border-t border-white/8 backdrop-blur-xl mt-0">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-5 gap-8">

            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/">
                <div className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent text-[1.75rem] font-black tracking-[0.05em] mb-3 inline-block hover:scale-105 transition-transform cursor-pointer">FIXR</div>
              </Link>
              <p className="text-gray-400 mb-6 max-w-sm text-sm leading-relaxed">
                AI-powered DevOps automation that monitors, analyzes, and fixes your CI/CD pipelines automatically.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/jatin12-alt" target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 transition-all hover:scale-110"
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#00d4ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'}
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com/in/jatin-dongre-6a13a3294" target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 transition-all hover:scale-110"
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#00d4ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#"
                  className="text-gray-500 transition-all hover:scale-110"
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#00d4ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'}
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="mailto:contact@fixr.dev"
                  className="text-gray-500 transition-all hover:scale-110"
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#00d4ff'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'}
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/7">
          <p className="text-gray-600 text-xs">
            © 2026 Fixr. All rights reserved. Built with ❤️ for developers.
          </p>
          <div className="flex space-x-6">
            {navigation.legal.map((item) => (
              <Link key={item.name} href={item.href}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
    
    {/* Back to Top Button */}
    {showBackToTop && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    )}
    </>
  )
}
