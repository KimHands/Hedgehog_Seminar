'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, STORAGE_BUCKET_PRESENTATIONS } from '@/utils/constants'

export function UploadDropzone() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSetFile(dropped)
  }

  function validateAndSetFile(f: File) {
    if (!f.name.endsWith('.pptx')) {
      setError('.pptx 파일만 업로드할 수 있습니다.')
      return
    }
    if (f.size > MAX_FILE_SIZE_BYTES) {
      setError(`파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하여야 합니다.`)
      return
    }
    setError('')
    setFile(f)
  }

  async function handleUpload() {
    if (!file || !title.trim()) {
      setError('제목과 파일을 모두 입력해주세요.')
      return
    }

    setIsUploading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('로그인이 필요합니다.'); setIsUploading(false); return }

    const safeFileName = file.name
      .replace(/\[|\]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^\w\-_.]/g, '')
    const filePath = `${user.id}/${Date.now()}_${safeFileName}`

    // Supabase Storage 직접 업로드 (클라이언트 → Storage)
    setProgress(30)
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET_PRESENTATIONS)
      .upload(filePath, file)

    if (uploadError) {
      setError('파일 업로드에 실패했습니다.')
      setIsUploading(false)
      return
    }

    setProgress(100)

    // DB 저장 + FastAPI 트리거
    const res = await fetch('/api/presentations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), file_path: filePath }),
    })

    if (!res.ok) {
      setError('발표 자료 등록에 실패했습니다.')
      setIsUploading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="max-w-xl space-y-5">
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">발표 제목</label>
            <Input
              placeholder="발표 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 px-8 text-center cursor-pointer transition-colors',
              isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
              file && 'border-primary/60 bg-primary/5'
            )}
          >
            {file ? (
              <>
                <FileText className="h-12 w-12 text-primary mb-3" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <p className="text-xs text-muted-foreground mt-3">클릭하여 다른 파일 선택</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="font-semibold mb-1">PPTX 파일을 드래그하거나 클릭하여 선택</p>
                <p className="text-sm text-muted-foreground mb-4">발표 자료를 업로드하면 AI가 자동으로 분석합니다</p>
                <p className="text-xs text-muted-foreground">최대 {MAX_FILE_SIZE_MB}MB · .pptx 파일만 지원</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pptx"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSetFile(f) }}
            />
          </div>

          {isUploading && (
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {progress < 100 ? `업로드 중... ${progress}%` : '분석 요청 중...'}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => router.back()}>취소</Button>
        <Button onClick={handleUpload} isLoading={isUploading} disabled={!file || !title.trim()}>
          업로드 시작
        </Button>
      </div>
    </div>
  )
}
