'use client'

import Link from 'next/link'
import { Github, Linkedin, Twitter, Mail, ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'

import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  const [showBackToTop, setShowBackToTop] = useState(false)

  if (pathname?.startsWith('/dashboard')) {
    return null
  }

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
      { name: 'Pricing', href: '/pricing' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Changelog', href: '/changelog' },
      { name: 'Roadmap', href: '/roadmap' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Security', href: '/security' },
    ],
  }

  return (
    <>
      <footer className="bg-[#0e0e11] border-t border-white/5 mt-0 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none translate-y-1/2" />
        <div className="container pt-[80px] pb-0 relative z-10">
          <div className="grid md:grid-cols-12 gap-16 lg:gap-24 pb-24">
            {/* COLUMN 1 — Brand (wider, ~30%) */}
            <div className="md:col-span-4 lg:col-span-5">
              <Link href="/" className="inline-block group mb-8">
                <div className="text-[24px] font-black text-white tracking-tighter text-glow">FIXR</div>
              </Link>
              <p className="text-white/40 mb-10 text-[15px] font-medium leading-relaxed italic max-w-xs">
                "Architecting the future of autonomous delivery through neural synthesis and precision telemetry."
              </p>
              <div className="flex space-x-8">
                {[
                  { Icon: Github, href: "https://github.com/jatin12-alt" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Mail, href: "mailto:hello@fixr.io" }
                ].map(({ Icon, href }, i) => (
                  <a key={i} href={href} 
                    className="text-white/20 hover:text-primary transition-all duration-300 hover:scale-110"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>

            {/* COLUMN 2 — Modules */}
            <div className="md:col-span-2 lg:col-span-2">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-10">
                Modules
              </h3>
              <ul className="space-y-4">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}
                      className="text-[13px] font-bold text-white/30 hover:text-primary transition-all flex items-center group"
                    >
                      <span className="w-0 h-[1px] bg-primary mr-0 group-hover:w-3 group-hover:mr-3 transition-all" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3 — Structure */}
            <div className="md:col-span-3 lg:col-span-2">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-10">
                Structure
              </h3>
              <ul className="space-y-4">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}
                      className="text-[13px] font-bold text-white/30 hover:text-primary transition-all flex items-center group"
                    >
                       <span className="w-0 h-[1px] bg-primary mr-0 group-hover:w-3 group-hover:mr-3 transition-all" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 4 — Protocol */}
            <div className="md:col-span-3 lg:col-span-3">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-10">
                Protocol
              </h3>
              <ul className="space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}
                      className="text-[13px] font-bold text-white/30 hover:text-primary transition-all flex items-center group"
                    >
                       <span className="w-0 h-[1px] bg-primary mr-0 group-hover:w-3 group-hover:mr-3 transition-all" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="py-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5">
            <p className="text-white/10 text-[11px] font-black uppercase tracking-[0.3em]">
              © 2025 Sentinel / Fixr. Core Protocol v4.0.2
            </p>
            <div className="flex items-center gap-4 text-white/10 text-[11px] font-black uppercase tracking-[0.3em]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow" />
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-12 right-12 z-50 w-16 h-16 bg-white text-black rounded-[20px] flex items-center justify-center shadow-2xl hover:bg-primary transition-all duration-500 hover:-translate-y-2 group"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6 group-hover:scale-125 transition-transform" />
        </button>
      )}
    </>
  )
}

