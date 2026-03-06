import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-10 py-5 border-b bg-card">
        <div className="flex items-center gap-2.5 font-bold text-primary text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          SeminarFeed
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href="/login">로그인</Link></Button>
          <Button asChild><Link href="/signup">회원가입</Link></Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-10 py-20">
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
            정보보호 연구실 전용 플랫폼
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-5">
            세미나 발표 자료<br />
            <span className="text-primary">AI 자동 분석</span> + 동료 피드백
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            PPTX 업로드 한 번으로 맞춤법 검사, 논리성 검토, 예상 질문을 자동 생성합니다.<br />
            연구실 동료들의 슬라이드별 피드백도 한 곳에서 확인하세요.
          </p>
          <div className="flex gap-3 justify-center mb-16">
            <Button size="lg" asChild><Link href="/signup">시작하기</Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/login">로그인</Link></Button>
          </div>

          <div className="grid grid-cols-3 gap-5 text-left">
            {[
              { icon: '📝', title: '맞춤법 자동 검사', desc: 'Gemini AI가 슬라이드 전체 텍스트의 한국어 맞춤법 오류를 찾아드립니다.' },
              { icon: '🧠', title: '논리성·정합성 검토', desc: '정보보안 심사위원 관점에서 발표 흐름과 주장의 근거를 검토합니다.' },
              { icon: '❓', title: '예상 질문 생성', desc: '청중 연구원 시각에서 실제로 나올 법한 심층 질문 10개를 생성합니다.' },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-semibold mb-2">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
