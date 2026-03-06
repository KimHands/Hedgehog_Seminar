'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { AnalysisTabs } from '@/features/analysis/AnalysisTabs'
import { cn } from '@/lib/utils'
import type { Slide, AnalysisResult, Feedback, UserRole } from '@/types/app.types'
import { STORAGE_BUCKET_THUMBNAILS } from '@/utils/constants'

interface SlideViewerProps {
  slides: Slide[]
  analysisResults: AnalysisResult[]
  initialFeedbacks: Feedback[]
  currentUserId: string
  currentUserRole: UserRole
  presentationId: string
}

export function SlideViewer({
  slides, analysisResults, initialFeedbacks, currentUserId, currentUserRole, presentationId,
}: SlideViewerProps) {
  const supabase = createSupabaseBrowserClient()
  const [selectedSlide, setSelectedSlide] = useState<Slide>(slides[0] ?? null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks)

  async function refreshFeedbacks() {
    const res = await fetch(`/api/presentations/${presentationId}`)
    const json = await res.json()
    if (json.data?.feedbacks) setFeedbacks(json.data.feedbacks)
  }

  function getThumbnailUrl(thumbnailPath: string | null): string | null {
    if (!thumbnailPath) return null
    const { data } = supabase.storage.from(STORAGE_BUCKET_THUMBNAILS).getPublicUrl(thumbnailPath)
    return data.publicUrl
  }

  return (
    <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: '220px 1fr' }}>
      {/* Slide List */}
      <div className="border-r border-border bg-card overflow-y-auto p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground px-1 mb-3">슬라이드 목록</p>
        {slides.map((slide) => {
          const thumbUrl = getThumbnailUrl(slide.thumbnail_path)
          return (
            <button
              key={slide.id}
              onClick={() => setSelectedSlide(slide)}
              className={cn(
                'w-full rounded-lg border-2 overflow-hidden text-left transition-all',
                selectedSlide?.id === slide.id ? 'border-primary' : 'border-transparent hover:border-primary/40'
              )}
            >
              <div className="aspect-video bg-gradient-to-br from-[#1E3A5F] to-primary flex items-center justify-center relative">
                {thumbUrl ? (
                  <Image src={thumbUrl} alt={`슬라이드 ${slide.slide_number}`} fill className="object-cover" />
                ) : (
                  <span className="text-white/50 text-xs">슬라이드 {slide.slide_number}</span>
                )}
              </div>
              <div className="px-2 py-1 text-xs text-muted-foreground bg-card">
                {slide.slide_number}
              </div>
            </button>
          )
        })}
      </div>

      {/* Slide Main */}
      <div className="flex flex-col overflow-hidden">
        {/* Viewer */}
        <div className="flex-1 bg-muted flex items-center justify-center p-6 overflow-hidden">
          <div className="relative aspect-video w-full max-w-2xl bg-gradient-to-br from-[#1E3A5F] to-primary rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
            {selectedSlide?.thumbnail_path && getThumbnailUrl(selectedSlide.thumbnail_path) ? (
              <Image
                src={getThumbnailUrl(selectedSlide.thumbnail_path)!}
                alt={`슬라이드 ${selectedSlide.slide_number}`}
                fill
                className="object-contain"
              />
            ) : (
              <div className="text-center text-white/80 px-8">
                <p className="text-lg font-medium">슬라이드 {selectedSlide?.slide_number}</p>
                {selectedSlide?.text_content && (
                  <p className="text-sm mt-2 opacity-70 line-clamp-4">{selectedSlide.text_content}</p>
                )}
              </div>
            )}
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
              {selectedSlide?.slide_number} / {slides.length}
            </span>
          </div>
        </div>

        {/* Analysis Tabs */}
        <AnalysisTabs
          selectedSlide={selectedSlide}
          analysisResults={analysisResults}
          feedbacks={feedbacks}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onFeedbackChange={refreshFeedbacks}
        />
      </div>
    </div>
  )
}
