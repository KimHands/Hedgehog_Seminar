'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * presentations.status 변경을 실시간 구독하여 페이지를 자동 새로고침합니다.
 */
export function useRealtimeStatus(presentationId: string) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel(`presentation-${presentationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'presentations',
          filter: `id=eq.${presentationId}`,
        },
        () => router.refresh()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [presentationId, router, supabase])
}

/**
 * 본인의 notifications를 실시간 구독하여 콜백을 호출합니다.
 */
export function useRealtimeNotifications(userId: string, onNewNotification: () => void) {
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        onNewNotification
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, onNewNotification, supabase])
}
