import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnalysisBadge } from '@/components/shared/AnalysisBadge'
import { formatRelativeTime } from '@/lib/utils'
import type { Presentation } from '@/types/app.types'

interface PresentationCardProps {
  presentation: Presentation & { profiles?: { name: string } }
}

export function PresentationCard({ presentation }: PresentationCardProps) {
  return (
    <Link href={`/presentations/${presentation.id}`}>
      <Card className="overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
        <div className="h-36 bg-gradient-to-br from-[#1E3A5F] to-primary flex items-center justify-center">
          <ShieldCheck className="h-12 w-12 text-white/60" />
        </div>
        <CardContent className="p-4">
          <p className="font-semibold truncate mb-3">{presentation.title}</p>
          <div className="flex items-center justify-between">
            <AnalysisBadge status={presentation.status} />
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(presentation.created_at)}
            </span>
          </div>
          {presentation.profiles && (
            <p className="text-xs text-muted-foreground mt-2">
              {presentation.profiles.name}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
