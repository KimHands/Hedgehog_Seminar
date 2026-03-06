'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatRelativeTime } from '@/lib/utils'
import type { Feedback, Slide, UserRole } from '@/types/app.types'

interface FeedbackPanelProps {
  slide: Slide | null
  feedbacks: Feedback[]
  currentUserId: string
  currentUserRole: UserRole
  onFeedbackChange: () => void
}

export function FeedbackPanel({ slide, feedbacks, currentUserId, currentUserRole, onFeedbackChange }: FeedbackPanelProps) {
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!content.trim() || !slide) return
    setIsSubmitting(true)

    await fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slide_id: slide.id, content }),
    })

    setContent('')
    setIsSubmitting(false)
    onFeedbackChange()
  }

  async function handleUpdate(id: string) {
    if (!editContent.trim()) return
    await fetch(`/api/feedbacks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    })
    setEditingId(null)
    onFeedbackChange()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/feedbacks/${id}`, { method: 'DELETE' })
    onFeedbackChange()
  }

  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground">
        슬라이드를 선택하면 피드백을 확인할 수 있습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {feedbacks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            이 슬라이드에 대한 피드백이 없습니다.
          </p>
        )}
        {feedbacks.map((fb) => (
          <div key={fb.id} className="rounded-lg border p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {fb.profiles?.name?.charAt(0) ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{fb.profiles?.name ?? '알 수 없음'}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(fb.created_at)}</p>
                </div>
              </div>
              {fb.reviewer_id === currentUserId && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { setEditingId(fb.id); setEditContent(fb.content) }}
                  >수정</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(fb.id)}>삭제</Button>
                </div>
              )}
            </div>
            {editingId === fb.id ? (
              <div className="space-y-2">
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={2} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>취소</Button>
                  <Button size="sm" onClick={() => handleUpdate(fb.id)}>저장</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm">{fb.content}</p>
            )}
          </div>
        ))}
      </div>

      {currentUserRole === 'reviewer' && (
        <div className="border-t p-3 flex gap-2">
          <Textarea
            placeholder="이 슬라이드에 대한 피드백을 작성하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="flex-1 resize-none text-sm"
          />
          <Button
            className="self-end"
            isLoading={isSubmitting}
            disabled={!content.trim()}
            onClick={handleSubmit}
          >
            등록
          </Button>
        </div>
      )}
    </div>
  )
}
