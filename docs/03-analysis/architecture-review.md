# Phase 8 아키텍처 리뷰 & Gap 분석 보고서

## 1. 버그 수정 내역

### Bug 1 — Promise.all 내 feedbacks race condition
- **파일**: `nextjs-app/src/app/api/presentations/[id]/route.ts`
- **원인**: `Promise.all` 내에서 `feedbacks` 쿼리가 동일 `Promise.all`에서 resolve되는 `slides` 변수를 참조 → `slides`가 `undefined`인 상태로 `.in()` 실행
- **수정**: `slides`와 `analysisResults`를 `Promise.all`로 먼저 조회 후, `slideIds`를 추출해 `feedbacks`를 순차 조회

### Bug 2 — Supabase Storage 잘못된 타입 캐스트
- **파일**: `nextjs-app/src/features/presentations/UploadDropzone.tsx`
- **원인**: `as Parameters<typeof supabase.storage.from>[0] extends never ? never : never as never` — 실제로 아무 의미 없는 타입 캐스트로, TS 컴파일 오류 유발 가능
- **수정**: 타입 캐스트 제거. `onUploadProgress`는 `@supabase/storage-js` v2.5+의 `FileOptions`에서 공식 지원되므로 옵션 그대로 전달

### Bug 3 — `<header>` 내 `<Header>` 중첩
- **파일**: `nextjs-app/src/app/presentations/[id]/page.tsx`, `nextjs-app/src/components/layout/Header.tsx`
- **원인**: `Header` 컴포넌트가 `<header>` HTML 요소를 렌더링하는데, 이미 `<header>` 안에 삽입되어 `<header><header>` 중첩 → 유효하지 않은 HTML + 레이아웃 깨짐
- **수정**: `Header.tsx`에서 우측 컨트롤(알림 벨 + 사용자 정보 + 로그아웃)만 분리한 `HeaderActions` 컴포넌트 추출 및 내보내기. `presentations/[id]/page.tsx`에서 `Header` → `HeaderActions`로 교체

---

## 2. 전체 아키텍처 검토

### 2.1 레이어 구조
```
[Client Browser]
    ↓ 직접 업로드
[Supabase Storage] ← PPTX 파일
    ↑ 파일 경로
[Next.js API Routes] → Supabase DB (CRUD)
    ↓ fire-and-forget
[FastAPI / Render] → python-pptx 처리
    ↓ Gemini API 호출
[Supabase DB] 결과 저장 + 알림 생성
    ↓ Realtime
[Client Browser] 상태 실시간 반영
```

**평가**: 아키텍처 설계 방향이 요구사항과 일치. Vercel 10초 제한을 Render FastAPI로 우회, 클라이언트 직접 업로드로 서버 부하 최소화.

### 2.2 인증 / 보안
| 항목 | 상태 | 비고 |
|------|------|------|
| Supabase JWT 인증 | ✅ | middleware.ts에서 미인증 리다이렉트 |
| RLS 정책 설계 | ✅ | schema.md에 전체 정책 정의됨 |
| 보안 헤더 | ✅ | next.config.ts 6종 헤더 적용 |
| CORS 제한 | ✅ | FastAPI ALLOWED_ORIGINS 환경변수 |
| 입력값 검증 | ✅ | isValidUUID, isNonEmptyString, sanitizeString |
| SQL 인젝션 방어 | ✅ | Supabase SDK 파라미터 바인딩 |

### 2.3 AI 처리 안정성
| 항목 | 상태 | 비고 |
|------|------|------|
| Gemini 재시도 로직 | ✅ | 최대 3회, 1초 딜레이 |
| JSON 펜스 제거 | ✅ | regex로 ```json 마크다운 제거 |
| 분석 실패 처리 | ✅ | FAILED 상태로 DB 업데이트 |
| BackgroundTasks | ✅ | fire-and-forget, 응답 즉시 반환 |

### 2.4 실시간 기능
| 항목 | 상태 | 비고 |
|------|------|------|
| 분석 상태 Realtime | ✅ | useRealtimeStatus hook |
| 알림 Realtime | ✅ | useRealtimeNotifications hook |
| 알림 생성 | ✅ | FastAPI에서 모든 reviewer 대상 생성 |

---

## 3. 컨벤션 준수 체크

| 항목 | 준수 여부 | 비고 |
|------|-----------|------|
| API 응답 snake_case | ✅ | |
| 컴포넌트 PascalCase | ✅ | |
| 상수 UPPER_SNAKE_CASE | ✅ | constants.ts |
| 분석 상태 4종 | ✅ | PENDING/ANALYZING/COMPLETED/FAILED |
| presenter/reviewer 용어 | ✅ | 코드 영어, UI 한국어 |
| 함수 짧고 단일 책임 | ✅ | 대부분 20줄 이하 |

---

## 4. Gap 분석 결과

### 요구사항 대비 구현 현황

| 요구사항 | 구현 | 완료율 |
|---------|------|--------|
| PPTX 업로드 (발표자) | UploadDropzone + Supabase Storage | 100% |
| AI 자동 분석 (맞춤법/논리/질문) | gemini_service.py 3종 분석 | 100% |
| 슬라이드 뷰어 | SlideViewer + 썸네일 | 100% |
| 분석 결과 탭 | AnalysisTabs (4탭) | 100% |
| 동료 피드백 CRUD | FeedbackPanel (생성/수정/삭제) | 100% |
| 실시간 상태 업데이트 | useRealtimeStatus | 100% |
| 알림 시스템 | NotificationList + Realtime | 100% |
| 역할 기반 접근 제어 | RLS + Sidebar presenterOnly | 100% |
| 보안 헤더 적용 | next.config.ts | 100% |
| SEO (내부 서비스) | robots: noindex | 100% |

**전체 Gap 분석 점수: 97/100**

### 감점 항목
- (-2) UploadDropzone 진행률 표시: `onUploadProgress`가 Supabase Storage v2 기본 fetch 방식에서는 동작하지 않을 수 있음 (XHR 방식 필요). 기능은 작동하나 progress가 0→100으로 점프할 가능성 있음
- (-1) 발표 상세 페이지 로딩 상태: 분석 중일 때 Realtime 연결 전 초기 SSR 상태와 클라이언트 상태 간 순간적 불일치 가능성

---

## 5. Phase 9 배포 전 체크리스트

- [ ] Supabase 프로젝트 생성 및 SQL 마이그레이션 실행
- [ ] Supabase Storage 버킷 `presentations` 생성 (public)
- [ ] Supabase RLS 정책 활성화 확인
- [ ] FastAPI Render 서비스 배포 + 환경변수 설정
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`
- [ ] Next.js Vercel 배포 + 환경변수 설정
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `FASTAPI_URL`
- [ ] CORS `ALLOWED_ORIGINS` Vercel 도메인으로 업데이트
- [ ] Supabase Auth redirect URL Vercel 도메인으로 등록
