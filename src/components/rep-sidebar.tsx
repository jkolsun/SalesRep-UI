'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Phone,
  Users,
  Clock,
  LogOut,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const navItems = [
  {
    label: 'Dashboard',
    href: '/rep/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Dialer',
    href: '/rep/dialer',
    icon: Phone,
  },
  {
    label: 'My Leads',
    href: '/rep/leads',
    icon: Users,
  },
  {
    label: 'Callbacks',
    href: '/rep/callbacks',
    icon: Clock,
  },
]

export function RepSidebar() {
  const pathname = usePathname()
  const { profile, signOut, isLoading } = useAuth()

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-64 flex-col border-r border-white/10 bg-brand-surface">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <Image
          src="https://www.brightautomations.org/images/Bright_AutoLOGO.png"
          alt="Bright Automations"
          width={150}
          height={40}
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 to-teal-400/10 text-white border-l-2 border-teal-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5',
                  isActive ? 'text-teal-400' : 'text-gray-500'
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || 'Sales Rep'}
            </p>
            <p className="text-xs text-gray-500 truncate">Sales Rep</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
