'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { MagneticButton } from '@/components/ui/MagneticButton'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      
      // Transparent vs frosted
      setScrolled(currentY > 50)
      
      // Hide/show on scroll direction
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true)  // scrolling down — hide
      } else {
        setHidden(false) // scrolling up — show
      }
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't show the global navbar on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]
  const linkColor = '#ffffff'
  const logoColor = '#ffffff'

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        background: scrolled ? 'rgba(19, 19, 23, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        boxShadow: scrolled ? '0 10px 40px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <nav className="w-full">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <span 
                className="text-[20px] font-black tracking-tighter transition-all duration-300 text-white group-hover:text-primary group-hover:text-glow"
              >
                FIXR
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-white/40 hover:text-primary group relative"
                >
                  {link.name}
                  <span 
                     className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full group-hover:shadow-[0_0_8px_rgba(0,212,255,0.5)]"
                  />
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/sign-in">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors cursor-pointer">
                  Client Portal
                </span>
              </Link>
              <MagneticButton>
                <Link href="/sign-up">
                  <Button 
                    className="h-10 px-6 font-black rounded-[8px] bg-white text-black text-[10px] uppercase tracking-widest transition-all duration-300 hover:bg-primary hover:shadow-glow"
                  >
                    Engage
                  </Button>
                </Link>
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 transition-colors duration-300 text-white"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="md:hidden py-16 bg-[#0e0e11] border-t border-white/5 absolute top-full left-0 w-full px-10 shadow-3xl h-[100vh]"
              >
                <div className="flex flex-col space-y-10">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-4xl font-black tracking-tighter text-white/20 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="pt-16 border-t border-white/5 flex flex-col gap-6">
                    <Link href="/sign-in" className="block w-full text-center" onClick={() => setIsOpen(false)}>
                       <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30">Portal Login</span>
                    </Link>
                    <Link href="/sign-up" className="block w-full" onClick={() => setIsOpen(false)}>
                      <Button className="w-full h-16 text-[10px] font-black uppercase tracking-widest bg-white text-black rounded-[12px]">
                        Access Entry
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  )
}
