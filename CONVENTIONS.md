# 코딩 컨벤션 (Coding Conventions)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼
> Phase: 2 - Coding Convention

---

## 1. 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `PresentationCard`, `SlideViewer` |
| 훅 | camelCase + `use` 접두사 | `usePresentation`, `useAuth` |
| 함수/변수 | camelCase | `fetchPresentation`, `slideCount` |
| 상수/enum | UPPER_SNAKE_CASE | `ANALYSIS_STATUS`, `MAX_FILE_SIZE` |
| 파일 (컴포넌트) | PascalCase.tsx | `PresentationCard.tsx` |
| 파일 (기타) | kebab-case.ts | `use-presentation.ts`, `api-client.ts` |
| 폴더 | kebab-case | `presentation-detail/`, `slide-viewer/` |
| DB 컬럼 / API 응답 | snake_case | `presentation_id`, `slide_number` |
| 타입/인터페이스 | PascalCase | `Presentation`, `AnalysisResult` |

---

## 2. 폴더 구조

```
seminar-feedback-platform/
├── nextjs-app/                   # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/                  # App Router 페이지
│   │   │   ├── (auth)/           # 인증 그룹 라우트
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── dashboard/
│   │   │   ├── upload/
│   │   │   ├── presentations/
│   │   │   │   └── [id]/
│   │   │   ├── notifications/
│   │   │   └── layout.tsx
│   │   ├── components/           # 재사용 컴포넌트
│   │   │   ├── ui/               # shadcn/ui 컴포넌트
│   │   │   ├── layout/           # 레이아웃 컴포넌트
│   │   │   └── shared/           # 공통 컴포넌트
│   │   ├── features/             # 기능별 모듈
│   │   │   ├── auth/
│   │   │   ├── presentations/
│   │   │   ├── slides/
│   │   │   ├── feedbacks/
│   │   │   └── notifications/
│   │   ├── hooks/                # 커스텀 훅
│   │   ├── lib/                  # 인프라 (API 클라이언트, Supabase)
│   │   │   ├── supabase/
│   │   │   └── api/
│   │   ├── types/                # 타입 정의
│   │   └── utils/                # 순수 유틸리티 함수
│   ├── .env.local                # 로컬 환경변수 (Git 제외)
│   ├── .env.example              # 환경변수 템플릿 (Git 포함)
│   └── ...
│
├── fastapi-backend/              # FastAPI Python 백엔드
│   ├── app/
│   │   ├── main.py               # FastAPI 앱 진입점
│   │   ├── routes/               # API 라우트
│   │   ├── services/             # 비즈니스 로직
│   │   │   ├── pptx_service.py   # PPTX 처리
│   │   │   ├── gemini_service.py # Gemini API 호출
│   │   │   └── supabase_service.py
│   │   └── models/               # 데이터 모델
│   ├── requirements.txt
│   ├── .env                      # 로컬 환경변수 (Git 제외)
│   └── .env.example
│
└── docs/
    ├── 01-plan/
    │   ├── glossary.md
    │   ├── schema.md
    │   ├── naming.md
    │   └── structure.md
    ├── 02-design/
    ├── 03-analysis/
    └── 04-report/
```

---

## 3. 코드 스타일

### TypeScript
- 엄격 모드(`strict: true`) 사용
- `any` 사용 금지 → `unknown` 또는 명확한 타입 사용
- 타입 추론 가능한 경우 명시적 타입 생략 가능
- 인터페이스보다 `type` 선호 (단, 확장 필요시 `interface`)

### React / Next.js
- 함수형 컴포넌트만 사용 (클래스 컴포넌트 금지)
- Server Component 기본, 클라이언트 상태 필요시만 `'use client'`
- 훅 호출 순서는 항상 일정하게 유지
- `key` prop은 항상 안정적인 값(id) 사용, index 금지

### Python (FastAPI)
- PEP 8 준수
- 타입 힌트 필수 (`def analyze(presentation_id: str) -> dict:`)
- 비동기 엔드포인트: `async def`
- 환경변수: `pydantic-settings` BaseSettings 사용

---

## 4. 환경변수 규칙

### Next.js (.env.local)

| 접두사 | 노출 범위 | 예시 |
|--------|----------|------|
| `NEXT_PUBLIC_` | 브라우저 노출 | `NEXT_PUBLIC_SUPABASE_URL` |
| (없음) | 서버 전용 | `SUPABASE_SERVICE_ROLE_KEY` |

### 네이밍
- 모두 UPPER_SNAKE_CASE
- 서비스명 접두사: `SUPABASE_*`, `FASTAPI_*`, `GEMINI_*`

---

## 5. API 통신 패턴

### Next.js API Route
```typescript
// app/api/presentations/route.ts
export async function GET(request: Request) {
  // 1. 인증 확인
  // 2. 비즈니스 로직 (서비스 레이어 호출)
  // 3. 응답 반환
  return Response.json({ data })
}
```

### Supabase 클라이언트 분리
- 서버 컴포넌트/API Route: `createServerClient` (서비스 롤 키)
- 클라이언트 컴포넌트: `createBrowserClient` (anon 키)

### FastAPI 통신
- Next.js API Route → FastAPI 호출 (fire-and-forget 패턴)
- FastAPI → Supabase 직접 업데이트 (Service Role Key)

---

## 6. 에러 처리

### 클라이언트
```typescript
// 사용자 표시용 에러는 toast 사용
// 개발 디버깅용은 console.error
try {
  await uploadFile(file)
} catch (error) {
  console.error('Upload failed:', error)
  toast.error('파일 업로드에 실패했습니다.')
}
```

### API Route
```typescript
// 표준 에러 응답 형식
return Response.json(
  { error: '메시지' },
  { status: 400 }
)
```

### FastAPI
```python
from fastapi import HTTPException

raise HTTPException(status_code=400, detail="오류 메시지")
```

---

## 7. 재사용성 원칙

- 같은 로직이 2곳 이상 사용되면 `utils/` 또는 `hooks/`로 추출
- 같은 UI 패턴이 2곳 이상 사용되면 `components/shared/`로 추출
- 하드코딩 값은 `constants.ts`로 분리

```typescript
// utils/constants.ts
export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const ANALYSIS_RETRY_LIMIT = 3
export const GEMINI_REQUEST_DELAY_MS = 1000
```

---

## 8. Git 규칙

### 브랜치 전략
- `main`: 배포 브랜치
- `dev`: 개발 브랜치
- `feat/기능명`: 기능 개발
- `fix/버그명`: 버그 수정

### 커밋 메시지
```
feat: PPTX 업로드 컴포넌트 구현
fix: 분석 상태 업데이트 오류 수정
docs: 스키마 문서 업데이트
refactor: 슬라이드 뷰어 컴포넌트 분리
```
