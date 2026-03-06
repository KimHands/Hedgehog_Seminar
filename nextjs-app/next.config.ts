import type { NextConfig } from 'next'

const securityHeaders = [
  // HTTPS 강제
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Clickjacking 방어
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // MIME 스니핑 방어
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer 정책
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // XSS 방어 (구형 브라우저)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // 권한 정책 (카메라/마이크 등 불필요한 API 차단)
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

export default nextConfig
