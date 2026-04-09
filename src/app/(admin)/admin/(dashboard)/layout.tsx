'use client'

import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'
import { usePathname } from 'next/navigation'
import { ToastProvider } from '@/components/admin/ui/ToastProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Format pathname into title "Dashboard" "Theme", etc.
  const segment = pathname.split('/').pop() || 'Dashboard'
  const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

  return (
    <ToastProvider>
      <div className="flex min-h-screen text-white relative">
        <div className="fixed inset-0 z-[-1] bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(74,14,143,0.15),rgba(255,255,255,0))]" />
        <Sidebar />
        <main className="admin-main flex flex-col w-full text-white">
          <Topbar title={title} />
          <div className="p-8 pb-20">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
