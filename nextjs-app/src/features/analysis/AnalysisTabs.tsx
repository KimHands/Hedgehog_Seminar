'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { AnalysisResult, Feedback, Slide, SpellResult, LogicResult, QuestionResult, UserRole } from '@/types/app.types'
import { FeedbackPanel } from '@/features/feedbacks/FeedbackPanel'

interface AnalysisTabsProps {
  selectedSlide: Slide | null
  analysisResults: AnalysisResult[]
  feedbacks: Feedback[]
  currentUserId: string
  currentUserRole: UserRole
  onFeedbackChange: () => void
}

const SEVERITY_STYLES = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
} as const

const DIFF_STYLES = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
} as const

const DIFF_LABELS = { easy: '쉬움', medium: '보통', hard: '어려움' }
const SEVERITY_LABELS = { high: '심각', medium: '보통', low: '낮음' }

export function AnalysisTabs({
  selectedSlide, analysisResults, feedbacks, currentUserId, currentUserRole, onFeedbackChange,
}: AnalysisTabsProps) {
  const slideNum = selectedSlide?.slide_number

  const spellResults = (analysisResults.find((r) => r.type === 'spell')?.result_json ?? []) as SpellResult[]
  const logicResults = (analysisResults.find((r) => r.type === 'logic')?.result_json ?? []) as LogicResult[]
  const questionResults = (analysisResults.find((r) => r.type === 'questions')?.result_json ?? []) as QuestionResult[]

  const slideSpell = slideNum ? spellResults.filter((r) => r.slide === slideNum) : spellResults
  const slideLogic = slideNum ? logicResults.filter((r) => r.slide === slideNum) : logicResults
  const slideFeedbacks = selectedSlide
    ? feedbacks.filter((f) => f.slide_id === selectedSlide.id)
    : []

  return (
    <div className="border-t border-border bg-card flex flex-col" style={{ maxHeight: '360px' }}>
      <Tabs defaultValue="feedback" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="h-auto rounded-none border-b bg-transparent justify-start px-4 gap-0">
          {[
            { value: 'feedback', label: '💬 피드백', count: slideFeedbacks.length },
            { value: 'spell', label: '📝 맞춤법', count: slideSpell.length },
            { value: 'logic', label: '🧠 논리성', count: slideLogic.length },
            { value: 'questions', label: '❓ 예상질문', count: questionResults.length },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-sm"
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5 py-0.5">{tab.count}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="feedback" className="flex-1 overflow-hidden flex flex-col m-0">
          <FeedbackPanel
            slide={selectedSlide}
            feedbacks={slideFeedbacks}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onFeedbackChange={onFeedbackChange}
          />
        </TabsContent>

        <TabsContent value="spell" className="flex-1 overflow-y-auto p-4 m-0">
          {slideSpell.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {slideNum ? '이 슬라이드에서 맞춤법 오류가 발견되지 않았습니다.' : '맞춤법 오류가 없습니다.'}
            </p>
          ) : slideSpell.map((item, i) => (
            <div key={i} className="mb-3 rounded-lg border border-l-4 border-l-amber-400 p-3">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">슬라이드 {item.slide}</span>
              </div>
              <div className="text-sm mb-1">
                <span className="line-through text-destructive">{item.original}</span>
                {' → '}
                <span className="text-emerald-600 font-medium">{item.corrected}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="logic" className="flex-1 overflow-y-auto p-4 m-0">
          {slideLogic.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {slideNum ? '이 슬라이드에서 논리성 문제가 발견되지 않았습니다.' : '논리성 문제가 없습니다.'}
            </p>
          ) : slideLogic.map((item, i) => (
            <div key={i} className="mb-3 rounded-lg border border-l-4 p-3"
              style={{ borderLeftColor: item.severity === 'high' ? '#EF4444' : item.severity === 'medium' ? '#F59E0B' : '#10B981' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-muted-foreground">슬라이드 {item.slide}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_STYLES[item.severity]}`}>
                  {SEVERITY_LABELS[item.severity]}
                </span>
              </div>
              <p className="text-sm font-medium mb-2">{item.issue}</p>
              <div className="text-xs bg-muted rounded p-2">💡 {item.suggestion}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="questions" className="flex-1 overflow-y-auto p-4 m-0">
          {questionResults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">예상 질문이 없습니다.</p>
          ) : questionResults.map((item, i) => (
            <div key={i} className="mb-3 rounded-lg border border-l-4 border-l-primary p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-muted-foreground">Q{i + 1}</span>
                <div className="flex gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${DIFF_STYLES[item.difficulty]}`}>
                    {DIFF_LABELS[item.difficulty]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.category}</span>
                </div>
              </div>
              <p className="text-sm">{item.question}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
