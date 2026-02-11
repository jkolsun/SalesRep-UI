import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminMobileNav } from '@/components/admin-mobile-nav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <AdminSidebar />
      <main className="md:pl-64">
        <div className="min-h-screen p-4 md:p-6 pb-mobile-nav">{children}</div>
      </main>
      <AdminMobileNav />
    </div>
  )
}
