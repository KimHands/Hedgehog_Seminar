import type { MetadataRoute } from 'next'

// 내부 연구실 전용 서비스 — 검색 엔진 크롤링 전체 차단
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  }
}
