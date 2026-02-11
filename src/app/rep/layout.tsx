import { RepSidebar } from '@/components/rep-sidebar'
import { RepMobileNav } from '@/components/rep-mobile-nav'

export default function RepLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <RepSidebar />
      <main className="md:pl-64">
        <div className="min-h-screen p-4 md:p-6 pb-mobile-nav">{children}</div>
      </main>
      <RepMobileNav />
    </div>
  )
}
