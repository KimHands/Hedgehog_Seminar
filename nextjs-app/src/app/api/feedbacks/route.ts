import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isNonEmptyString, isValidUUID } from '@/utils/validate'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'reviewer') {
    return Response.json({ error: '피드백 진행자만 피드백을 작성할 수 있습니다.' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const { slide_id, content } = body as Record<string, unknown>

  if (!isValidUUID(slide_id)) {
    return Response.json({ error: '유효하지 않은 slide_id입니다.' }, { status: 400 })
  }
  if (!isNonEmptyString(content, 2000)) {
    return Response.json({ error: '피드백 내용은 1자 이상 2000자 이하여야 합니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .insert({ slide_id, reviewer_id: user.id, content: (content as string).trim() })
    .select('*, profiles(name, role)')
    .single()

  if (error) return Response.json({ error: '피드백 저장에 실패했습니다.' }, { status: 500 })

  return Response.json({ data }, { status: 201 })
}
