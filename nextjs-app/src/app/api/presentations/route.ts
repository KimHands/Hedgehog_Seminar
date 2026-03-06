import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { isNonEmptyString, isValidFilePath } from '@/utils/validate'
import { NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('presentations')
    .select('*, profiles(name, role)')
    .order('created_at', { ascending: false })

  if (profile?.role === 'presenter') {
    query = query.eq('uploader_id', user.id)
  }

  const { data, error } = await query
  if (error) return Response.json({ error: '데이터를 불러오는데 실패했습니다.' }, { status: 500 })

  return Response.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'presenter') {
    return Response.json({ error: '발표자만 업로드할 수 있습니다.' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const { title, file_path } = body as Record<string, unknown>

  if (!isNonEmptyString(title, 200)) {
    return Response.json({ error: '제목은 1자 이상 200자 이하여야 합니다.' }, { status: 400 })
  }
  if (!isValidFilePath(file_path)) {
    return Response.json({ error: '유효하지 않은 파일 경로입니다.' }, { status: 400 })
  }

  const serviceClient = createSupabaseServiceClient()

  const { data: presentation, error } = await serviceClient
    .from('presentations')
    .insert({ uploader_id: user.id, title: title.trim(), file_path, status: 'PENDING' })
    .select()
    .single()

  if (error) return Response.json({ error: '발표 자료 등록에 실패했습니다.' }, { status: 500 })

  triggerAnalysis(presentation.id, file_path).catch((err) =>
    console.error('[ANALYSIS TRIGGER ERROR]', err)
  )

  return Response.json({ data: presentation }, { status: 201 })
}

async function triggerAnalysis(presentationId: string, filePath: string) {
  const fastApiUrl = process.env.FASTAPI_BASE_URL
  if (!fastApiUrl) return

  await fetch(`${fastApiUrl}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      presentation_id: presentationId,
      file_path: filePath,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    }),
  })
}
