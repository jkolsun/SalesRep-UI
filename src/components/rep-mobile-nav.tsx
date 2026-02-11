'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Phone,
  Users,
  Clock,
  DollarSign,
} from 'lucide-react'

const navItems = [
  {
    label: 'Home',
    href: '/rep/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Dialer',
    href: '/rep/dialer',
    icon: Phone,
  },
  {
    label: 'Leads',
    href: '/rep/leads',
    icon: Users,
  },
  {
    label: 'Callbacks',
    href: '/rep/callbacks',
    icon: Clock,
  },
  {
    label: 'Earnings',
    href: '/rep/earnings',
    icon: DollarSign,
  },
]

export function RepMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/10 bg-brand-surface/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[60px] transition-all active:scale-95',
                isActive
                  ? 'text-teal-400'
                  : 'text-gray-500'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all',
                isActive && 'bg-teal-500/20'
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
