import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isNonEmptyString, isValidUUID } from '@/utils/validate'
import { NextRequest } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!isValidUUID(id)) return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '인증이 필요합니다.' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return Response.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const { content } = body as Record<string, unknown>
  if (!isNonEmptyString(content, 2000)) {
    return Response.json({ error: '내용을 입력해주세요.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .update({ content: (content as string).trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('reviewer_id', user.id)
    .select()
    .single()

  if (error || !data) {
    return Response.json({ error: '피드백을 수정할 수 없습니다.' }, { status: 403 })
  }

  return Response.json({ data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!isValidUUID(id)) return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { error } = await supabase
    .from('feedbacks')
    .delete()
    .eq('id', id)
    .eq('reviewer_id', user.id)

  if (error) return Response.json({ error: '피드백을 삭제할 수 없습니다.' }, { status: 403 })

  return new Response(null, { status: 204 })
}
