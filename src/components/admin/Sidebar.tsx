'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Package,
  Layers,
  Truck,
  Settings,
  LogOut,
  ChevronRight,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/quotations', label: 'Quotations', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { divider: true, label: 'Master Data' },
  { href: '/items', label: 'Items Master', icon: Package },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/services', label: 'Services', icon: Briefcase },
  { href: '/assets', label: 'Assets', icon: Truck },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-[#1e3a5f] text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-5 border-b border-blue-800">
        <Logo size="md" className="[&_span]:text-white [&_span.text-orange-500]:text-orange-400" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          if ('divider' in item) {
            return (
              <div key={index} className="pt-4 pb-1">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider px-3">
                  {item.label}
                </p>
              </div>
            )
          }

          const Icon = item.icon!
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-800 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-blue-100 hover:text-white hover:bg-blue-800"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
