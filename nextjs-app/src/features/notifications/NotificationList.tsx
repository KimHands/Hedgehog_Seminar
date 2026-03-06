'use client'

import { useRouter } from 'next/navigation'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types/app.types'

interface NotificationListProps {
  notifications: Notification[]
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter()

  async function handleClick(n: Notification) {
    if (!n.is_read) {
      await fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })
    }
    if (n.presentation_id) {
      router.push(`/presentations/${n.presentation_id}`)
    }
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.is_read)
    await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })))
    router.refresh()
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm">
        <span className="text-5xl mb-4">🔔</span>
        <p>새 알림이 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {notifications.some((n) => !n.is_read) && (
        <div className="flex justify-end mb-4">
          <button onClick={markAllRead} className="text-sm text-primary hover:underline">
            전체 읽음 처리
          </button>
        </div>
      )}
      <div className="rounded-lg border overflow-hidden bg-card">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={cn(
              'flex w-full items-start gap-4 p-4 border-b last:border-b-0 text-left transition-colors hover:bg-muted/40',
              !n.is_read && 'bg-primary/5'
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
              📊
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(n.created_at)}</p>
            </div>
            {!n.is_read && (
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
