# 정보보호 연구실 세미나 자동 피드백 플랫폼
## Claude Code 프롬프트 & 요구사항 명세서

---

## 📌 Claude Code 초기 프롬프트

```
정보보호 연구실 세미나 자료에 대해 자동 피드백을 제공하는 풀스택 웹 서비스를 개발해줘.

기술 스택:
- Frontend + API: Next.js 14 (App Router)
- Database + Auth + Storage: Supabase
- AI: Gemini API (gemini-2.5-flash, Free Tier)
- UI: shadcn/ui + Tailwind CSS
- 배포: Vercel (Frontend) + Render (Python 백엔드)
- Python 백엔드: FastAPI (PPTX 처리 전용)

아래 요구사항 명세서를 기반으로 개발을 진행해줘.
프로젝트 이름은 "seminar-feedback-platform"으로 설정해줘.
```

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 정보보호 연구실 세미나 피드백 플랫폼 |
| 목적 | 세미나 발표 자료(PPTX)에 대한 자동 분석 및 동료 피드백 제공 |
| 대상 사용자 | 정보보호 연구실 구성원 (발표자, 피드백 진행자) |
| 배포 환경 | Vercel + Render + Supabase |

---

## 2. 기술 스택 상세

### Frontend / BFF
```
Framework  : Next.js 14 (App Router)
Language   : TypeScript
UI Library : shadcn/ui
Styling    : Tailwind CSS (시스템 다크모드 대응)
Font       : Pretendard (한국어 최적화)
Icon       : lucide-react
Animation  : tailwindcss-animate
Theme      : next-themes (시스템 설정 자동 감지)
```

### Backend (PPTX 처리 전용)
```
Framework  : FastAPI (Python)
주요 라이브러리:
  - python-pptx  (PPTX 텍스트/슬라이드 추출)
  - Pillow        (슬라이드 썸네일 이미지 생성)
  - httpx         (Gemini API 비동기 호출)
배포       : Render (Free Tier)
```

### Infrastructure
```
Database   : Supabase (PostgreSQL)
Auth       : Supabase Auth (이메일/비밀번호)
Storage    : Supabase Storage (PPTX 파일, 썸네일 이미지)
Realtime   : Supabase Realtime (푸시 알림)
AI         : Gemini API - gemini-2.5-flash (Free Tier)
```

### 디자인 시스템
```
모드       : 시스템 설정 자동 감지 (Light / Dark)
톤         : 모던 & 테크 감성
색상 계열  : 블루/네이비

Primary Color Palette:
  --primary-500: #3B82F6  (메인 액션)
  --primary-600: #2563EB  (hover)
  --primary-900: #1E3A5F  (네이비 강조)

Semantic:
  --success: #10B981
  --warning: #F59E0B
  --error:   #EF4444

Background (Light / Dark):
  base:    #F8FAFC  /  #0F172A
  surface: #FFFFFF  /  #1E293B
  subtle:  #F1F5F9  /  #334155
```

---

## 3. 사용자 역할 정의

### 3.1 발표자 (Presenter)
- PPTX 파일 업로드
- 자신이 업로드한 파일의 자동 분석 결과 열람
- 피드백 진행자의 슬라이드별 피드백 열람
- 예상 질문 리스트 열람

### 3.2 피드백 진행자 (Reviewer)
- 발표자 업로드 알림 수신
- 슬라이드별 피드백 의견 작성/수정/삭제
- 자동 분석 결과 열람

> 회원가입 시 역할 선택. 관리자 승인 없이 자유 선택 가능.

---

## 4. 기능 요구사항

### 4.1 인증 (AUTH)

| ID | 기능 | 우선순위 |
|----|------|---------|
| AUTH-01 | 이메일/비밀번호 회원가입 (역할 선택 포함) | 필수 |
| AUTH-02 | 로그인 / 로그아웃 | 필수 |
| AUTH-03 | 역할 기반 접근 제어 (발표자/피드백 진행자) | 필수 |
| AUTH-04 | 세션 유지 (Supabase Auth 기본 제공) | 필수 |

### 4.2 파일 업로드 (UPLOAD)

| ID | 기능 | 우선순위 |
|----|------|---------|
| UPLOAD-01 | PPTX 파일 드래그앤드롭 업로드 | 필수 |
| UPLOAD-02 | 파일 크기 제한: 50MB | 필수 |
| UPLOAD-03 | 업로드 진행률 표시 | 필수 |
| UPLOAD-04 | Supabase Storage에 파일 저장 | 필수 |
| UPLOAD-05 | 업로드 완료 시 FastAPI 백엔드로 처리 요청 전송 | 필수 |

### 4.3 알림 (NOTIFICATION)

| ID | 기능 | 우선순위 |
|----|------|---------|
| NOTIFY-01 | 발표자 업로드 시 피드백 진행자 전원에게 실시간 알림 | 필수 |
| NOTIFY-02 | Supabase Realtime 기반 인앱 알림 (벨 아이콘) | 필수 |
| NOTIFY-03 | 알림 읽음 처리 | 선택 |

### 4.4 자동 분석 (ANALYSIS)

PPTX 업로드 후 FastAPI 백엔드에서 Gemini API를 통해 비동기 처리.

#### 4.4.1 한국어 맞춤법 검사 (SPELL)
- PPTX에서 전체 텍스트 추출 (python-pptx)
- Gemini API에 텍스트 전달하여 맞춤법 오류 탐지
- 응답 형식: `[{ slide: 번호, original: "원문", corrected: "수정안", description: "설명" }]`

#### 4.4.2 논리성·정합성 검사 (LOGIC)
- 슬라이드 전체 내용을 Gemini API에 전달
- Gemini의 학습 데이터 기반으로 논리적 흐름, 주장의 근거 적절성 검토
- (웹 검색 미사용 - Free Tier 비용 절감)
- 응답 형식: `[{ slide: 번호, issue: "문제점", suggestion: "개선안", severity: "high|medium|low" }]`

#### 4.4.3 예상 질문 생성 (QUESTIONS)
- 발표 내용 전체를 Gemini API에 전달
- 청중이 실제로 할 법한 심층 질문 10개 생성
- 정보보안 연구실 특성 반영 (보안 취약점, 논문 방법론, 실험 재현성 등)
- 응답 형식: `[{ question: "질문", category: "방법론|보안|실험|기타", difficulty: "easy|medium|hard" }]`

#### 4.4.4 분석 상태 관리
```
PENDING   → 업로드 완료, 분석 대기
ANALYZING → FastAPI에서 처리 중
COMPLETED → 분석 완료
FAILED    → 분석 실패 (재시도 버튼 제공)
```

### 4.5 슬라이드별 피드백 (FEEDBACK)

| ID | 기능 | 우선순위 |
|----|------|---------|
| FEEDBACK-01 | 피드백 진행자가 슬라이드별 텍스트 피드백 작성 | 필수 |
| FEEDBACK-02 | 피드백 수정/삭제 | 필수 |
| FEEDBACK-03 | 피드백 작성 시간 표시 | 필수 |
| FEEDBACK-04 | 피드백 작성자 표시 | 필수 |

---

## 5. 페이지 구조 (IA)

```
/                       → 랜딩 (로그인/회원가입 링크)
/login                  → 로그인
/signup                 → 회원가입 (역할 선택 포함)

/dashboard              → 메인 대시보드
  - 발표자: 내 업로드 목록 + 상태
  - 피드백 진행자: 전체 업로드 목록

/upload                 → PPTX 업로드 (발표자 전용)

/presentations/[id]     → 발표 상세 페이지
  - 슬라이드 썸네일 목록 (좌측)
  - 선택된 슬라이드 상세 + 피드백 패널 (우측)
  - 탭: 피드백 / 맞춤법 / 논리성 / 예상질문

/notifications          → 알림 목록
```

---

## 6. DB 스키마 (Supabase PostgreSQL)

```sql
-- 사용자 프로필 (Supabase Auth users 테이블 확장)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('presenter', 'reviewer')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 발표 자료
CREATE TABLE presentations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id   UUID REFERENCES profiles(id),
  title         TEXT NOT NULL,
  file_path     TEXT NOT NULL,        -- Supabase Storage 경로
  slide_count   INTEGER,
  status        TEXT DEFAULT 'PENDING'
                CHECK (status IN ('PENDING','ANALYZING','COMPLETED','FAILED')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 슬라이드 썸네일
CREATE TABLE slides (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id   UUID REFERENCES presentations(id) ON DELETE CASCADE,
  slide_number      INTEGER NOT NULL,
  thumbnail_path    TEXT,              -- Supabase Storage 경로
  text_content      TEXT               -- 추출된 텍스트
);

-- 자동 분석 결과
CREATE TABLE analysis_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id   UUID REFERENCES presentations(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('spell','logic','questions')),
  result_json       JSONB NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 슬라이드별 피드백
CREATE TABLE feedbacks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id          UUID REFERENCES slides(id) ON DELETE CASCADE,
  reviewer_id       UUID REFERENCES profiles(id),
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 알림
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id),
  presentation_id   UUID REFERENCES presentations(id),
  message           TEXT NOT NULL,
  is_read           BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. API 설계

### Next.js API Routes

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/presentations` | 업로드 완료 후 DB 저장 + FastAPI 분석 트리거 |
| GET | `/api/presentations` | 목록 조회 |
| GET | `/api/presentations/[id]` | 상세 조회 |
| POST | `/api/feedbacks` | 피드백 작성 |
| PUT | `/api/feedbacks/[id]` | 피드백 수정 |
| DELETE | `/api/feedbacks/[id]` | 피드백 삭제 |
| GET | `/api/notifications` | 알림 목록 |
| PATCH | `/api/notifications/[id]` | 알림 읽음 처리 |

### FastAPI Routes (Render 배포)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/analyze` | 분석 요청 수신 및 처리 시작 |
| GET | `/health` | 헬스체크 |

#### `/analyze` 요청 바디
```json
{
  "presentation_id": "uuid",
  "file_path": "supabase-storage-path",
  "supabase_url": "...",
  "supabase_key": "..."
}
```

#### FastAPI 처리 흐름
```
1. Supabase Storage에서 PPTX 다운로드
2. python-pptx로 슬라이드별 텍스트 추출
3. Pillow로 슬라이드 썸네일 이미지 생성 → Supabase Storage 업로드
4. Gemini API 병렬 호출 (맞춤법 / 논리성 / 예상질문)
5. 결과를 analysis_results 테이블에 저장
6. presentations.status = 'COMPLETED' 업데이트
7. 피드백 진행자 전원에게 notifications 레코드 생성
```

---

## 8. Gemini API 프롬프트 설계

### 맞춤법 검사
```
너는 한국어 맞춤법 전문가야.
아래 발표 슬라이드 텍스트에서 맞춤법/문법 오류를 찾아줘.

[텍스트]
{extracted_text}

반드시 다음 JSON 배열 형식으로만 응답해. 다른 설명은 하지 마.
[{"slide": 슬라이드번호, "original": "오류 원문", "corrected": "수정안", "description": "설명"}]
오류가 없으면 빈 배열 []을 반환해.
```

### 논리성·정합성 검사
```
너는 정보보안 분야 연구 발표 심사위원이야.
아래 발표 슬라이드 내용의 논리적 흐름과 주장의 근거 적절성을 검토해줘.

[슬라이드 내용]
{slides_text}

반드시 다음 JSON 배열 형식으로만 응답해. 다른 설명은 하지 마.
[{"slide": 슬라이드번호, "issue": "문제점", "suggestion": "개선안", "severity": "high|medium|low"}]
문제가 없으면 빈 배열 []을 반환해.
```

### 예상 질문 생성
```
너는 정보보안 연구실 세미나에서 발표를 듣는 연구원이야.
아래 발표 내용을 읽고 발표자에게 실제로 할 법한 심층 질문 10개를 생성해줘.

[발표 내용]
{slides_text}

반드시 다음 JSON 배열 형식으로만 응답해. 다른 설명은 하지 마.
[{"question": "질문 내용", "category": "방법론|보안|실험|기타", "difficulty": "easy|medium|hard"}]
```

---

## 9. 주요 UI 컴포넌트

### 레이아웃
```
┌─────────────────────────────────────────┐
│  Header (64px): 로고 + 알림벨 + 유저메뉴  │
├──────────┬──────────────────────────────┤
│ Sidebar  │  Main Content               │
│ (240px)  │  - 대시보드 / 업로드 / 상세  │
│          │                             │
└──────────┴──────────────────────────────┘
```

### 발표 상세 페이지 레이아웃
```
┌─────────────────────────────────────────┐
│  Header                                  │
├────────────────┬────────────────────────┤
│ 슬라이드 목록  │  선택된 슬라이드 뷰     │
│ (썸네일 세로   │  + 탭 패널             │
│  스크롤)       │  [피드백|맞춤법|논리성  │
│                │   |예상질문]           │
└────────────────┴────────────────────────┘
```

### 분석 상태 뱃지
```
PENDING   → 회색 pill  "대기 중"
ANALYZING → 파란 pill  "분석 중..." (spinner)
COMPLETED → 초록 pill  "완료"
FAILED    → 빨간 pill  "실패" + 재시도 버튼
```

---

## 10. 환경변수 목록

### Next.js (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FASTAPI_BASE_URL=                  # Render 배포 URL
```

### FastAPI (.env)
```env
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 11. 개발 우선순위 (Phase)

### Phase 1 - 핵심 기능
1. Supabase 프로젝트 세팅 (Auth, DB, Storage)
2. Next.js 프로젝트 세팅 (shadcn/ui, next-themes, Pretendard)
3. 회원가입 / 로그인 / 역할 기반 라우팅
4. PPTX 업로드 (Supabase Storage 연동)
5. FastAPI 세팅 + python-pptx 텍스트 추출 + 썸네일 생성

### Phase 2 - AI 분석
6. Gemini API 연동 (맞춤법 / 논리성 / 예상질문)
7. 분석 결과 저장 및 UI 표시
8. 분석 상태 실시간 업데이트

### Phase 3 - 피드백 & 알림
9. 슬라이드별 피드백 CRUD
10. Supabase Realtime 알림 (업로드 시 피드백 진행자에게)
11. 알림 읽음 처리 UI

### Phase 4 - 마무리
12. 반응형 레이아웃 점검
13. 에러 처리 및 로딩 상태 전반 점검
14. Vercel + Render 배포 설정

---

## 12. 주요 주의사항

### Gemini API Free Tier 관련
- 모델: `gemini-2.5-flash` 고정 사용
- Rate Limit 대응: 분석 요청 간 **1초 딜레이** 추가 (429 방지)
- 실패 시 **최대 3회 재시도 로직** 구현
- 응답은 반드시 JSON 파싱 후 저장 (```json 마크다운 펜스 제거 처리 필수)

### Vercel Free Tier 관련
- Serverless Function에서 PPTX 처리 금지 (10초 제한 초과 위험)
- 파일 업로드는 **클라이언트에서 직접 Supabase Storage로** 업로드
- Next.js API Route는 DB 조회/저장 및 FastAPI 트리거 역할만 담당

### 보안
- Supabase RLS(Row Level Security) 반드시 활성화
  - profiles: 본인만 수정 가능
  - feedbacks: reviewer만 작성, 본인만 수정/삭제
  - presentations: 본인 업로드만 삭제 가능
- Storage 버킷: presentations 버킷은 인증된 사용자만 접근
