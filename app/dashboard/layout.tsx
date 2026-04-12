'use client'

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
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/providers/FirebaseAuthProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-20 bg-[#0e0e11]">
        <div className="p-8 border-b border-white/5 h-24 flex items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">FIXR</span>
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded shadow-glow-subtle">Core</span>
          </Link>
        </div>

        <nav className="flex-grow p-6 space-y-2 mt-6">
          <p className="px-4 mb-4 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Command Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
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
      <main className="flex-grow pl-64 transition-all duration-300 bg-[#131317]">
        <div className="min-h-screen relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] blur-[150px] pointer-events-none rounded-full" />
          {children}
        </div>
      </main>
    </div>
  )
}
