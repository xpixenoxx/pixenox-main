'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Layers, 
  Briefcase, 
  Tags, 
  ThumbsUp, 
  MessageSquare, 
  Building2, 
  Footprints, 
  Search, 
  Mail,
  LogOut,
  Cpu,
  BookOpen,
  HelpCircle
} from 'lucide-react'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/brand', label: 'Brand', icon: Palette },
  { href: '/admin/theme', label: 'Theme', icon: Type },
  { href: '/admin/hero', label: 'Hero Section', icon: ImageIcon },
  { href: '/admin/services', label: 'Services', icon: Layers },
  { href: '/admin/case-studies', label: 'Case Studies', icon: Briefcase },
  { href: '/admin/work-tags', label: 'Work Tags', icon: Tags },
  { href: '/admin/why-choose-us', label: 'Why Choose Us', icon: ThumbsUp },
  { href: '/admin/technology-stack', label: 'Tech Stack', icon: Cpu },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/faqs', label: 'Global FAQs', icon: HelpCircle },
  { href: '/admin/home-faqs', label: 'Home FAQs', icon: HelpCircle },
  { href: '/admin/company', label: 'Company', icon: Building2 },
  { href: '/admin/footer', label: 'Footer', icon: Footprints },
  { href: '/admin/seo', label: 'SEO Config', icon: Search },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar fixed h-screen left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-white border-opacity-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">Pixenox</h1>
        <p className="text-sm opacity-50 mt-1">Admin Platform</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {link.label}
            </Link>
          )
        })}

        <div className="mt-8 mb-2 px-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
          Communications
        </div>
        
        <Link 
          href="/admin/contact-submissions"
          className={`admin-nav-link ${pathname.includes('/admin/contact-submissions') ? 'active' : ''}`}
        >
          <Mail className="w-5 h-5 mr-3" />
          Submissions
        </Link>
      </nav>

      <div className="p-4 border-t border-white border-opacity-10">
        <form action="/auth/signout" method="post">
          <button type="submit" className="admin-nav-link w-full text-left flex items-center text-red-400 hover:text-red-300 hover:bg-red-400/10">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
