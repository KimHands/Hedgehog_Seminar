import { AppLayout } from '@/components/layout/AppLayout'
import { UploadDropzone } from '@/features/presentations/UploadDropzone'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function UploadPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'presenter') redirect('/dashboard')

  return (
    <AppLayout userName={profile?.name ?? ''} role={profile?.role}>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">발표 자료 업로드</h1>
        <p className="text-sm text-muted-foreground mt-1">PPTX 파일을 업로드하면 자동 분석이 시작됩니다</p>
      </div>
      <UploadDropzone />
    </AppLayout>
  )
}
