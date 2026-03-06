import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AppLayout } from '@/components/layout/AppLayout'
import { PresentationCard } from '@/features/presentations/PresentationCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Presentation } from '@/types/app.types'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('presentations')
    .select('*, profiles(name, role)')
    .order('created_at', { ascending: false })

  if (profile?.role === 'presenter') {
    query = query.eq('uploader_id', user.id)
  }

  const { data: presentations } = await query
  const list = (presentations ?? []) as (Presentation & { profiles: { name: string } })[]

  const stats = {
    total: list.length,
    completed: list.filter((p) => p.status === 'COMPLETED').length,
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <AppLayout userName={profile?.name ?? ''} unreadCount={notifications?.length ?? 0} role={profile?.role}>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.role === 'presenter' ? '내 발표 자료 목록 및 분석 현황' : '전체 발표 자료 목록'}
          </p>
        </div>
        {profile?.role === 'presenter' && (
          <Button asChild><Link href="/upload">+ 자료 업로드</Link></Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">총 업로드</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">발표 자료</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">분석 완료</p>
            <p className="text-3xl font-bold mt-1 text-emerald-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground mt-1">완료됨</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">미읽음 알림</p>
            <p className="text-3xl font-bold mt-1 text-primary">{notifications?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">새 알림</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-base font-semibold mb-4">발표 자료 목록</h2>
      {list.length === 0 ? (
        <EmptyState
          icon="📁"
          title="발표 자료가 없습니다"
          description={profile?.role === 'presenter' ? 'PPTX 파일을 업로드하면 AI가 자동으로 분석해드립니다.' : '아직 업로드된 발표 자료가 없습니다.'}
          action={profile?.role === 'presenter' ? <Button asChild><Link href="/upload">첫 자료 업로드</Link></Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((p) => <PresentationCard key={p.id} presentation={p} />)}
        </div>
      )}
    </AppLayout>
  )
}
