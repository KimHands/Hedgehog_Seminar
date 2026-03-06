import { redirect } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { NotificationList } from '@/features/notifications/NotificationList'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Notification } from '@/types/app.types'

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: notifications }] = await Promise.all([
    supabase.from('profiles').select('name, role').eq('id', user.id).single(),
    supabase
      .from('notifications')
      .select('*, presentations(id, title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length

  return (
    <AppLayout userName={profile?.name ?? ''} role={profile?.role} unreadCount={unreadCount}>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">알림</h1>
          <p className="text-sm text-muted-foreground mt-1">새 발표 자료 업로드 알림</p>
        </div>
      </div>
      <NotificationList notifications={(notifications ?? []) as Notification[]} />
    </AppLayout>
  )
}
