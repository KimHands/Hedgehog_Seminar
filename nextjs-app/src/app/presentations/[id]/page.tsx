import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnalysisBadge } from '@/components/shared/AnalysisBadge'
import { SlideViewer } from '@/features/slides/SlideViewer'
import { HeaderActions } from '@/components/layout/Header'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Feedback } from '@/types/app.types'

export default async function PresentationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: presentation }] = await Promise.all([
    supabase.from('profiles').select('name, role').eq('id', user.id).single(),
    supabase.from('presentations').select('*, profiles(name)').eq('id', id).single(),
  ])

  if (!presentation) notFound()

  const { data: slides } = await supabase
    .from('slides')
    .select('*')
    .eq('presentation_id', id)
    .order('slide_number')

  const { data: analysisResults } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('presentation_id', id)

  const slideIds = (slides ?? []).map((s) => s.id)
  const { data: feedbacks } = slideIds.length > 0
    ? await supabase.from('feedbacks').select('*, profiles(name, role)').in('slide_id', slideIds)
    : { data: [] }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div
      className="grid min-h-screen"
      style={{
        gridTemplateRows: 'var(--header-height) 1fr',
        gridTemplateColumns: '1fr',
      }}
    >
      <header
        className="flex items-center justify-between px-6 bg-card border-b border-border"
        style={{ gridArea: '1 / 1' }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />뒤로</Link>
          </Button>
          <div>
            <p className="font-semibold text-sm">{presentation.title}</p>
            <p className="text-xs text-muted-foreground">
              {(presentation.profiles as { name: string })?.name} · {formatDate(presentation.created_at)}
              {presentation.slide_count ? ` · ${presentation.slide_count}슬라이드` : ''}
            </p>
          </div>
          <AnalysisBadge status={presentation.status} />
        </div>
        <HeaderActions userName={profile?.name ?? ''} unreadCount={notifications?.length ?? 0} />
      </header>

      <div className="flex overflow-hidden" style={{ gridArea: '2 / 1' }}>
        {(slides ?? []).length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {presentation.status === 'ANALYZING' ? '분석 중입니다. 잠시 후 새로고침 해주세요.' : '슬라이드가 없습니다.'}
          </div>
        ) : (
          <SlideViewer
            slides={slides ?? []}
            analysisResults={analysisResults ?? []}
            initialFeedbacks={(feedbacks ?? []) as Feedback[]}
            currentUserId={user.id}
            currentUserRole={profile?.role ?? 'reviewer'}
            presentationId={id}
          />
        )}
      </div>
    </div>
  )
}
