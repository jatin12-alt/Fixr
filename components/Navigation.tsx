'use client'

import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import Link from 'next/link'
import { Button } from './ui/button'
import { Menu, X, Zap, Users, BookOpen, Star, ArrowUp } from 'lucide-react'

export function Navigation() {
  const { isSignedIn } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    const diff = latest - previous

    // Hide navbar on scroll DOWN (if scrolled enough), show on scroll UP
    if (latest > 100 && diff > 10) {
      setHidden(true)
    } else if (diff < -10 || latest < 50) {
      setHidden(false)
    }

    // At top = no background blur
    setAtTop(latest < 20)
    // Show back-to-top after 400px
    setShowBackToTop(latest > 400)
  })

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigationItems = [
    { name: 'Features',      href: '/features',      icon: Zap },
    { name: 'How It Works',  href: '/how-it-works',  icon: BookOpen },
    { name: 'Reviews',       href: '/reviews',        icon: Star },
    { name: 'About',         href: '/about',          icon: Users },
  ]

  return (
    <>
      {/* ── NAVBAR ── */}
      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: atTop ? 'rgba(5,5,8,0.3)' : 'rgba(5,5,8,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: atTop ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div className="container mx-auto px-6 py-4" style={{ minHeight: '72px' }}>
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-black cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.05em',
                  filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.4))',
                }}
              >
                FIXR
              </motion.div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <item.icon className="h-3.5 w-3.5 group-hover:text-cyan-400 transition-colors" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                  <UserButton
                    appearance={{
                      baseTheme: dark,
                      elements: {
                        userButtonAvatarBox: 'w-8 h-8 ring-2 ring-cyan-500',
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden mt-4 pt-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex flex-col space-y-4 pb-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {isSignedIn ? (
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                      </Link>
                    ) : (
                      <>
                        <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                        </Link>
                        <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                            Get Started
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ── BACK TO TOP button ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={scrollToTop}
            style={{
              position: 'fixed',
              bottom: '32px',
              right: '32px',
              zIndex: 50,
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,212,255,0.4)',
            }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(0,212,255,0.7)' }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
