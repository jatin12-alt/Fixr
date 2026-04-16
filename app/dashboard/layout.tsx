'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  GitBranch, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  LogOut,
  Zap,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/providers/FirebaseAuthProvider'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Repositories', href: '/dashboard/repos', icon: GitBranch },
    { name: 'Teams', href: '/dashboard/teams', icon: Users },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-[#131317] selection:bg-primary selection:text-black">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0e0e11] border-b border-white/5 flex items-center justify-between px-6 z-[60] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-white">FIXR</span>
          <span className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded">Core</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-[55] bg-[#0e0e11] transition-transform duration-500 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden lg:flex p-8 border-b border-white/5 h-24 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">FIXR</span>
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded shadow-glow-subtle">Core</span>
          </Link>
        </div>

        <nav className="flex-grow p-6 space-y-2 mt-20 lg:mt-6">
          <p className="px-4 mb-4 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Command Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary text-black shadow-glow" 
                    : "text-white/30 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2 mb-4">
          <Link
            href="/help"
            className="flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-all"
          >
            <HelpCircle className="h-4 w-4" />
            Telemetry Support
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-primary transition-all"
          >
            <LogOut className="h-4 w-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow lg:pl-64 transition-all duration-300 bg-[#131317]">
        <div className="min-h-screen relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] lg:w-[800px] h-[400px] lg:h-[800px] bg-primary/[0.03] blur-[100px] lg:blur-[150px] pointer-events-none rounded-full" />
          <div className="px-4 md:px-10 lg:px-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
