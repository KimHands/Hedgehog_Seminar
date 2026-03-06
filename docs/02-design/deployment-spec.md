# 배포 명세서 (Deployment Specification)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼
> Phase: 9 - Deployment

---

## 서비스 구성

| 서비스 | 플랫폼 | 용도 |
|--------|--------|------|
| Next.js 14 (App Router) | Vercel | 프론트엔드 + API Routes |
| FastAPI (Python) | Render (Free) | PPTX 처리 + AI 분석 |
| PostgreSQL + Auth + Storage + Realtime | Supabase | 전체 백엔드 인프라 |

---

## 1. Supabase 설정

### 1-1. 프로젝트 생성
1. [supabase.com](https://supabase.com) → New project
2. Name: `seminar-feedback-platform`
3. Region: `Northeast Asia (Seoul)` (ap-northeast-2)
4. Password: 강력한 DB 비밀번호 설정 후 별도 보관

### 1-2. SQL 마이그레이션
- `supabase/migrations/001_initial.sql` 전체 내용을
  Supabase Dashboard → SQL Editor → New query에 붙여넣고 실행

### 1-3. Storage 버킷 생성

| 버킷 이름 | 공개 여부 | 용도 |
|-----------|-----------|------|
| `presentations` | Private (인증 필요) | PPTX 원본 파일 |
| `thumbnails` | Public | 슬라이드 썸네일 |

```
Storage → New bucket
- presentations: Public 체크 해제, File size limit: 50MB
- thumbnails: Public 체크, File size limit: 5MB
```

### 1-4. Storage RLS 정책

**presentations 버킷**:
```sql
-- 업로드: 인증된 사용자 (presenter)
CREATE POLICY "presentations storage: upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'presentations' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 다운로드: 인증된 사용자
CREATE POLICY "presentations storage: download"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'presentations');
```

**thumbnails 버킷**:
```sql
-- 공개 읽기
CREATE POLICY "thumbnails storage: public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'thumbnails');
```

### 1-5. Auth 설정
- Authentication → URL Configuration
  - Site URL: `https://your-app.vercel.app`
  - Redirect URLs: `https://your-app.vercel.app/**`
- Realtime: Database → Replication → `presentations`, `notifications` 테이블 활성화

### 1-6. 키 확인 (후속 단계에서 사용)
- Settings → API:
  - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon / public key
  - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (비공개)

---

## 2. Render (FastAPI) 배포

### 2-1. 서비스 생성
1. [render.com](https://render.com) → New Web Service
2. GitHub 저장소 연결 → `fastapi-backend` 폴더 루트로 설정
3. Runtime: Python 3
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

> `render.yaml` 파일이 저장소 루트에 있으면 자동 감지됩니다.

### 2-2. 환경변수 설정

| 변수명 | 값 |
|--------|-----|
| `GEMINI_API_KEY` | Google AI Studio에서 발급 |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

### 2-3. Health Check
- `fastapi-backend/app/main.py`에 `/health` 엔드포인트 확인
- Render 대시보드에서 Health Check Path: `/health`

### 2-4. 배포 URL 확인
- 배포 완료 후 `https://seminar-feedback-api.onrender.com` 형태의 URL 복사
- 이 URL을 Vercel의 `FASTAPI_BASE_URL` 환경변수에 사용

---

## 3. Vercel (Next.js) 배포

### 3-1. 프로젝트 연결
1. [vercel.com](https://vercel.com) → New Project
2. GitHub 저장소 연결
3. Root Directory: `nextjs-app`
4. Framework: Next.js (자동 감지)

### 3-2. 환경변수 설정

| 변수명 | 환경 | 값 |
|--------|------|----|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Supabase service_role key |
| `FASTAPI_BASE_URL` | Production, Preview | Render 서비스 URL |

### 3-3. 배포 도메인 후처리
배포 후 생성된 `*.vercel.app` 도메인을:
- Supabase Auth → Redirect URLs에 추가
- Render `ALLOWED_ORIGINS` 환경변수에 추가 후 재배포

---

## 4. 환경변수 요약

### nextjs-app/.env.local (로컬 개발용)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
FASTAPI_BASE_URL=http://localhost:8000
```

### fastapi-backend/.env (로컬 개발용)
```env
GEMINI_API_KEY=AIzaSy...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 5. 로컬 개발 실행

```bash
# Next.js
cd nextjs-app
npm install
npm run dev          # http://localhost:3000

# FastAPI
cd fastapi-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

---

## 6. 배포 순서

```
1. Supabase 프로젝트 생성 + SQL 마이그레이션 실행
2. Supabase Storage 버킷 생성 + RLS 정책 설정
3. Render FastAPI 배포 + 환경변수 설정
4. Vercel Next.js 배포 + 환경변수 설정
5. Supabase Auth redirect URL → Vercel 도메인으로 업데이트
6. Render ALLOWED_ORIGINS → Vercel 도메인으로 업데이트 후 재배포
7. E2E 동작 확인 (회원가입 → 업로드 → 분석 → 피드백)
```
