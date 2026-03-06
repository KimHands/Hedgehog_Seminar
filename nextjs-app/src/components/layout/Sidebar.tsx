'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Upload, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/app.types'

interface SidebarProps {
  role?: UserRole
}

const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/upload', label: '발표 자료 업로드', icon: Upload, presenterOnly: true },
  { href: '/notifications', label: '알림', icon: Bell },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.presenterOnly || role === 'presenter'
  )

  return (
    <aside
      className="flex flex-col gap-1 bg-card border-r border-border px-3 py-4"
      style={{ gridArea: 'sidebar' }}
    >
      {visibleItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </aside>
  )
}
