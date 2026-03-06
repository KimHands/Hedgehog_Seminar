import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '세미나 피드백 플랫폼',
    template: '%s | 세미나 피드백 플랫폼',
  },
  description: '정보보호 연구실 세미나 발표 자료 자동 분석 및 동료 피드백 플랫폼',
  robots: {
    index: false,   // 내부 연구실 전용 — 검색 엔진 인덱싱 차단
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: '세미나 피드백 플랫폼',
    description: '정보보호 연구실 세미나 자료 AI 분석 및 동료 피드백 서비스',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
