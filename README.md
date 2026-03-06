# 세미나 피드백 플랫폼 (Seminar Feedback Platform)

> 정보보호 연구실 세미나 발표 자료(PPTX) 자동 분석 및 동료 피드백 서비스

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)](https://vercel.com)

---

## 서비스 개요

PPTX 파일을 업로드하면 Gemini AI가 자동으로 분석하고, 연구실 동료들이 슬라이드별 피드백을 남길 수 있는 내부 전용 웹 플랫폼입니다.

**주요 기능:**
- PPTX 업로드 → AI 자동 분석 (맞춤법, 논리성, 예상 질문)
- 슬라이드 썸네일 뷰어
- 슬라이드별 동료 피드백 작성/수정/삭제
- 분석 완료 시 실시간 알림 (Supabase Realtime)
- 발표자 / 피드백 진행자 역할 분리

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS + Pretendard 폰트 |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| AI 처리 서버 | FastAPI (Python) + Gemini API (gemini-2.5-flash) |
| 배포 | Vercel (Next.js) + Render (FastAPI) |

---

## 프로젝트 구조

```
seminar-feedback-platform/
├── nextjs-app/               # Next.js 14 프론트엔드 + API Routes
│   ├── src/
│   │   ├── app/              # App Router 페이지 및 API
│   │   ├── components/       # 공용 컴포넌트 (UI, Layout)
│   │   ├── features/         # 기능별 컴포넌트
│   │   ├── hooks/            # Realtime 커스텀 훅
│   │   ├── lib/              # Supabase 클라이언트
│   │   ├── types/            # TypeScript 타입 정의
│   │   └── utils/            # 유틸리티 함수
│   └── ...
├── fastapi-backend/          # Python FastAPI PPTX 처리 서버
│   ├── app/
│   │   ├── routes/           # /analyze 엔드포인트
│   │   ├── services/         # PPTX, Gemini, Supabase 서비스
│   │   └── models/           # Pydantic 스키마
│   ├── render.yaml           # Render 배포 설정
│   └── requirements.txt
├── supabase/
│   └── migrations/
│       └── 001_initial.sql   # DB 스키마 + RLS 정책 마이그레이션
├── docs/                     # 설계 문서 (9단계 파이프라인 산출물)
│   ├── 01-plan/              # 스키마, 용어, 컨벤션
│   ├── 02-design/            # API 명세, 디자인 시스템, 배포 명세
│   ├── 03-analysis/          # 코드 리뷰, Gap 분석
│   └── 04-report/            # 배포 보고서
└── mockup/                   # HTML/CSS 목업 (7개 화면)
```

---

## 로컬 개발 환경 설정

### 사전 요구사항
- Node.js 18+
- Python 3.11+
- Supabase 프로젝트
- Google AI Studio API Key (Gemini)

### 1. 환경변수 설정

**nextjs-app/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
FASTAPI_BASE_URL=http://localhost:8000
```

**fastapi-backend/.env**
```env
GEMINI_API_KEY=AIzaSy...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ALLOWED_ORIGINS=http://localhost:3000
```

### 2. Supabase 설정

1. Supabase Dashboard → SQL Editor에서 `supabase/migrations/001_initial.sql` 실행
2. Storage → `presentations` 버킷 생성 (Private)
3. Storage → `thumbnails` 버킷 생성 (Public)
4. Storage RLS 정책 추가:

```sql
-- presentations 버킷 업로드 허용
CREATE POLICY "presentations upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'presentations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- presentations 버킷 읽기 허용
CREATE POLICY "presentations read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'presentations');

-- thumbnails 공개 읽기
CREATE POLICY "thumbnails public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'thumbnails');
```

5. Authentication → Providers → Email → **Enable email confirmations: OFF** (내부 서비스)

### 3. 실행

```bash
# Next.js
cd nextjs-app
npm install
npm run dev   # http://localhost:3000

# FastAPI
cd fastapi-backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000
```

---

## 배포 현황

| 서비스 | URL | 상태 |
|--------|-----|------|
| Next.js (Vercel) | https://hedgehog-seminar.vercel.app | ✅ 운영 중 |
| FastAPI (Render) | https://seminar-feedback-api.onrender.com | ⚠️ 중단 (하단 참고) |
| Supabase | argyadueqwwfhghmqdch.supabase.co | ✅ 운영 중 |

---

## ⚠️ 개발 중단 사유 — Render 무료 플랜 메모리 제한

### 문제

FastAPI 백엔드는 PPTX 분석 시 아래 작업을 수행합니다:
1. **python-pptx** — PPTX 파일 파싱 및 텍스트 추출
2. **Pillow** — 슬라이드 썸네일 이미지 생성
3. **Gemini API** — 맞춤법/논리성/예상 질문 분석 (3회 호출)

이 과정에서 슬라이드 수가 많거나 파일 크기가 클 경우 **512MB 메모리 제한(Render 무료 플랜)** 을 초과해 프로세스가 강제 종료됩니다.

### Render 무료 플랜 제약
| 항목 | 제한 |
|------|------|
| RAM | 512MB |
| CPU | 0.1 vCPU (공유) |
| 비활성 슬립 | 15분 미사용 시 슬립 → 콜드 스타트 30~60초 |
| 월 실행 시간 | 750시간 |

### 해결 방안 (향후 재개 시)

**Option 1 — Render 유료 플랜 전환 (권장)**
- Starter 플랜: $7/월, RAM 512MB → 충분하지 않을 수 있음
- Standard 플랜: $25/월, RAM 2GB → 안정적

**Option 2 — 경량화**
- Pillow 썸네일 생성 제거 (텍스트 분석만 유지)
- Gemini 호출을 병렬 처리 대신 슬라이드 수 제한 적용

**Option 3 — 대안 플랫폼**
- **Google Cloud Run** (무료 크레딧 $300, 메모리 최대 32GB 설정 가능)
- **Railway** ($5 크레딧/월, RAM 512MB~8GB)
- **Fly.io** (무료 티어 256MB, 유료 시 유연)

**Option 4 — 서버리스 전환**
- Vercel Functions 대신 **AWS Lambda** (최대 10GB RAM, 15분 타임아웃)
- 단, PPTX 처리 라이브러리 의존성 레이어 설정 필요

---

## 역할 구분

| 역할 | 코드 | 권한 |
|------|------|------|
| 발표자 | `presenter` | PPTX 업로드, 분석 결과 열람 |
| 피드백 진행자 | `reviewer` | 피드백 작성/수정/삭제, 알림 수신 |

---

## 분석 흐름

```
[사용자] PPTX 업로드
    ↓ 클라이언트 → Supabase Storage (직접 업로드)
[Next.js API] presentations 레코드 생성 (status: PENDING)
    ↓ fire-and-forget
[FastAPI/Render] 분석 시작 (status: ANALYZING)
    ├── python-pptx: 슬라이드 텍스트 추출
    ├── Pillow: 썸네일 생성 → Storage 저장
    └── Gemini API × 3: 맞춤법 / 논리성 / 예상 질문
[Supabase DB] 결과 저장 (status: COMPLETED)
    ↓ Realtime
[사용자] 실시간 상태 업데이트 확인
```

---

## 문서

| 문서 | 경로 |
|------|------|
| 용어 정의 | `docs/01-plan/glossary.md` |
| DB 스키마 | `docs/01-plan/schema.md` |
| API 명세 | `docs/02-design/api-spec.md` |
| 배포 절차 | `docs/02-design/deployment-spec.md` |
| 코드 리뷰 / Gap 분석 | `docs/03-analysis/architecture-review.md` |
| 배포 보고서 | `docs/04-report/deployment-report.md` |
