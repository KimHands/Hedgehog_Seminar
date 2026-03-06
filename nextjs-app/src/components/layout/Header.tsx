'use client'

import Link from 'next/link'
import { Bell, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  userName?: string
  unreadCount?: number
}

export function Header({ userName = '', unreadCount = 0 }: HeaderProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className="flex items-center justify-between px-6 bg-card border-b border-border sticky top-0 z-50"
      style={{ gridArea: 'header', height: 'var(--header-height)' }}
    >
      <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-primary">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="text-base">SeminarFeed</span>
      </Link>

      <HeaderActions userName={userName} unreadCount={unreadCount} />
    </header>
  )
}

export function HeaderActions({ userName = '', unreadCount = 0 }: HeaderProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/notifications">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </Link>

      <div className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {userName.charAt(0)}
        </div>
        <span>{userName}</span>
      </div>

      <Button variant="ghost" size="icon" onClick={handleLogout} title="로그아웃">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
