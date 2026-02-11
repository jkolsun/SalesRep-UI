'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Users,
  UserCog,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Upload,
  ListChecks,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    section: 'Leads',
  },
  {
    label: 'Import Leads',
    href: '/admin/leads/import',
    icon: Upload,
  },
  {
    label: 'All Leads',
    href: '/admin/leads',
    icon: Users,
  },
  {
    label: 'Lead Lists',
    href: '/admin/leads/lists',
    icon: ListChecks,
  },
  {
    section: 'Team',
  },
  {
    label: 'Reps',
    href: '/admin/reps',
    icon: UserCog,
  },
  {
    section: 'Finance',
  },
  {
    label: 'Commissions',
    href: '/admin/commissions',
    icon: DollarSign,
    badge: 5, // Demo: pending approvals
  },
  {
    section: 'Insights',
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { profile, signOut, isLoading } = useAuth()

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A'
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
        <Badge variant="secondary" className="ml-auto text-xs">
          Admin
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item, index) => {
          if ('section' in item) {
            return (
              <div
                key={index}
                className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {item.section}
              </div>
            )
          }

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
              {item.badge && (
                <Badge
                  variant="warning"
                  className="ml-auto h-5 min-w-[20px] justify-center bg-orange-500/20 text-orange-400 px-1.5 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
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
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 truncate">Administrator</p>
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
