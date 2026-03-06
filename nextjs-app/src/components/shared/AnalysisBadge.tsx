import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AnalysisStatus } from '@/types/app.types'

interface AnalysisBadgeProps {
  status: AnalysisStatus
  className?: string
}

const STATUS_CONFIG: Record<AnalysisStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning'; showSpinner: boolean }> = {
  PENDING: { label: '대기 중', variant: 'secondary', showSpinner: false },
  ANALYZING: { label: '분석 중...', variant: 'default', showSpinner: true },
  COMPLETED: { label: '완료', variant: 'success', showSpinner: false },
  FAILED: { label: '실패', variant: 'destructive', showSpinner: false },
}

export function AnalysisBadge({ status, className }: AnalysisBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.showSpinner && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {status === 'COMPLETED' && <span>✓</span>}
      {config.label}
    </Badge>
  )
}
