import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data: presentation, error: presError } = await supabase
    .from('presentations')
    .select('*, profiles(name, role)')
    .eq('id', id)
    .single()

  if (presError || !presentation) {
    return Response.json({ error: '발표 자료를 찾을 수 없습니다.' }, { status: 404 })
  }

  const [{ data: slides }, { data: analysisResults }] = await Promise.all([
    supabase.from('slides').select('*').eq('presentation_id', id).order('slide_number'),
    supabase.from('analysis_results').select('*').eq('presentation_id', id),
  ])

  const slideIds = (slides ?? []).map((s: { id: string }) => s.id)
  const { data: feedbacks } = slideIds.length > 0
    ? await supabase.from('feedbacks').select('*, profiles(name, role)').in('slide_id', slideIds)
    : { data: [] }

  return Response.json({ data: { presentation, slides, analysisResults, feedbacks } })
}
