# 보안 명세서 (Security Specification)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼
> Phase: 7 - SEO/Security

---

## 보안 레이어 구조

```
Browser
  ↓ HTTPS (Strict-Transport-Security)
Next.js (Vercel)
  ↓ Security Headers
Middleware (JWT 검증)
  ↓ 인증 확인
API Routes (입력 검증 + 권한 확인)
  ↓ RLS
Supabase PostgreSQL
```

---

## HTTP 보안 헤더 (next.config.ts)

| 헤더 | 값 | 효과 |
|------|-----|------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS 강제 |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking 방어 |
| `X-Content-Type-Options` | `nosniff` | MIME 스니핑 방어 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer 정보 제한 |
| `X-XSS-Protection` | `1; mode=block` | 구형 브라우저 XSS 방어 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 불필요 API 차단 |

---

## 인증 / 인가

| 계층 | 구현 |
|------|------|
| Middleware | Supabase JWT 검증 → 미인증 시 `/login` 리다이렉트 |
| API Route | `supabase.auth.getUser()` 재검증 (middleware 우회 방어) |
| DB | Supabase RLS 정책으로 행 수준 접근 제어 |

**역할 기반 접근 제어:**

| 엔드포인트 | presenter | reviewer |
|-----------|:---------:|:-------:|
| GET /api/presentations | ✅ (본인것만) | ✅ (전체) |
| POST /api/presentations | ✅ | ❌ 403 |
| POST /api/feedbacks | ❌ 403 | ✅ |
| PUT/DELETE /api/feedbacks/[id] | ❌ 403 | ✅ (본인것만) |

---

## 입력 검증 (utils/validate.ts)

| 함수 | 검증 대상 | 방어 효과 |
|------|----------|----------|
| `isValidUUID()` | id 파라미터 | Injection 방어 |
| `isNonEmptyString()` | 텍스트 필드 | 빈 값 + 길이 초과 방어 |
| `isValidFilePath()` | 파일 경로 | Path Traversal 방어 (`..` 차단) |
| `sanitizeString()` | 사용자 입력 | XSS 방어 |

---

## Supabase RLS 정책

| 테이블 | 정책 |
|--------|------|
| profiles | SELECT: 인증 사용자 전체 / UPDATE: 본인만 |
| presentations | SELECT: 인증 전체 / INSERT: presenter만 / DELETE: 본인만 |
| slides | SELECT: 인증 전체 / INSERT: Service Role만 |
| analysis_results | SELECT: 인증 전체 / INSERT: Service Role만 |
| feedbacks | SELECT: 인증 전체 / INSERT: reviewer만 / UPDATE/DELETE: 본인만 |
| notifications | SELECT/UPDATE: 본인만 / INSERT: Service Role만 |

---

## FastAPI 보안

| 항목 | 구현 |
|------|------|
| CORS | `ALLOWED_ORIGINS` 환경변수로 허용 오리진 명시적 제한 |
| 허용 메서드 | GET, POST만 허용 |
| 에러 메시지 | 내부 오류 상세 노출 없음 (콘솔에만 기록) |

---

## 환경변수 보안

| 변수 | 브라우저 노출 | 용도 |
|------|:----------:|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | RLS 적용된 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | 서버 전용 (RLS 우회 권한) |
| `FASTAPI_BASE_URL` | ❌ | 서버 전용 |
| `GEMINI_API_KEY` | ❌ | FastAPI 서버 전용 |

---

## 보안 체크리스트

- [x] HTTPS 강제 (HSTS 헤더)
- [x] XSS 방어 (헤더 + React 자동 이스케이프)
- [x] Clickjacking 방어 (X-Frame-Options)
- [x] MIME 스니핑 방어
- [x] Path Traversal 방어 (파일 경로 검증)
- [x] 입력 길이 제한 (모든 텍스트 필드)
- [x] UUID 형식 검증 (id 파라미터)
- [x] CORS 제한 (FastAPI)
- [x] RLS 활성화 (전 테이블)
- [x] Service Role Key 서버 전용 사용
- [x] 에러 메시지 최소화 (내부 오류 미노출)
- [x] 검색 엔진 인덱싱 차단 (robots.ts)
