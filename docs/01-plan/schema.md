# 데이터 스키마 정의서 (Schema)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼
> Phase: 1 - Schema/Terminology
> DB: Supabase PostgreSQL

---

## 엔티티 관계도 (ERD 개요)

```
auth.users (Supabase 기본)
    |
    | 1:1
    v
profiles ─────────────────────────────────────────────┐
    |                                                   |
    | 1:N (presenter)                                   | 1:N (reviewer)
    v                                                   v
presentations ──────────── 1:N ──────────── analysis_results
    |
    | 1:N
    v
slides ──── 1:N ──── feedbacks (reviewer_id → profiles)

notifications (user_id → profiles, presentation_id → presentations)
```

---

## 테이블 상세 정의

### 1. profiles

사용자 프로필. Supabase Auth `auth.users` 테이블의 확장.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, FK→auth.users | Supabase Auth 사용자 ID |
| `name` | TEXT | NOT NULL | 사용자 이름 |
| `role` | TEXT | NOT NULL, CHECK(presenter\|reviewer) | 역할 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 생성 시각 |

**RLS 정책**:
- SELECT: 인증된 사용자 전체 조회 가능
- UPDATE: 본인만 수정 가능 (`id = auth.uid()`)

---

### 2. presentations

발표자가 업로드한 PPTX 파일 및 분석 상태 관리.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 발표 자료 ID |
| `uploader_id` | UUID | FK→profiles(id) | 업로드한 발표자 |
| `title` | TEXT | NOT NULL | 발표 제목 |
| `file_path` | TEXT | NOT NULL | Supabase Storage 경로 |
| `slide_count` | INTEGER | | 총 슬라이드 수 |
| `status` | TEXT | DEFAULT 'PENDING', CHECK(PENDING\|ANALYZING\|COMPLETED\|FAILED) | 분석 상태 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 업로드 시각 |

**RLS 정책**:
- SELECT: 인증된 사용자 전체 조회 가능
- INSERT: presenter 역할만 가능
- DELETE: 본인(uploader_id = auth.uid())만 가능

---

### 3. slides

PPTX에서 추출한 슬라이드별 데이터.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 슬라이드 ID |
| `presentation_id` | UUID | FK→presentations(id) ON DELETE CASCADE | 소속 발표 자료 |
| `slide_number` | INTEGER | NOT NULL | 슬라이드 번호 (1부터 시작) |
| `thumbnail_path` | TEXT | | Supabase Storage 썸네일 경로 |
| `text_content` | TEXT | | python-pptx로 추출한 텍스트 |

**RLS 정책**:
- SELECT: 인증된 사용자 전체 조회 가능
- INSERT/UPDATE/DELETE: Service Role Key만 (FastAPI 백엔드)

---

### 4. analysis_results

Gemini API 분석 결과 저장.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 분석 결과 ID |
| `presentation_id` | UUID | FK→presentations(id) ON DELETE CASCADE | 소속 발표 자료 |
| `type` | TEXT | NOT NULL, CHECK(spell\|logic\|questions) | 분석 타입 |
| `result_json` | JSONB | NOT NULL | Gemini 응답 JSON |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 분석 완료 시각 |

**result_json 스키마**:

```json
// type = "spell"
[{"slide": 1, "original": "오류 원문", "corrected": "수정안", "description": "설명"}]

// type = "logic"
[{"slide": 1, "issue": "문제점", "suggestion": "개선안", "severity": "high|medium|low"}]

// type = "questions"
[{"question": "질문 내용", "category": "방법론|보안|실험|기타", "difficulty": "easy|medium|hard"}]
```

**RLS 정책**:
- SELECT: 인증된 사용자 전체 조회 가능
- INSERT/UPDATE: Service Role Key만 (FastAPI 백엔드)

---

### 5. feedbacks

피드백 진행자가 슬라이드별로 작성하는 피드백.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 피드백 ID |
| `slide_id` | UUID | FK→slides(id) ON DELETE CASCADE | 대상 슬라이드 |
| `reviewer_id` | UUID | FK→profiles(id) | 작성한 피드백 진행자 |
| `content` | TEXT | NOT NULL | 피드백 내용 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 작성 시각 |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | 수정 시각 |

**RLS 정책**:
- SELECT: 인증된 사용자 전체 조회 가능
- INSERT: reviewer 역할만 가능
- UPDATE/DELETE: 본인(reviewer_id = auth.uid())만 가능

---

### 6. notifications

발표 자료 업로드 시 피드백 진행자에게 발송되는 알림.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 알림 ID |
| `user_id` | UUID | FK→profiles(id) | 수신자 (reviewer) |
| `presentation_id` | UUID | FK→presentations(id) | 연관 발표 자료 |
| `message` | TEXT | NOT NULL | 알림 메시지 |
| `is_read` | BOOLEAN | DEFAULT false | 읽음 여부 |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | 생성 시각 |

**RLS 정책**:
- SELECT: 본인(user_id = auth.uid())만 조회 가능
- UPDATE: 본인만 is_read 업데이트 가능
- INSERT: Service Role Key만 (FastAPI 백엔드)

---

## Supabase Storage 버킷 구조

```
presentations/        ← presentations 버킷 (인증 필수)
  {presentation_id}/
    original.pptx     ← 업로드된 원본 PPTX

thumbnails/           ← thumbnails 버킷 (공개 읽기 가능)
  {presentation_id}/
    slide_1.png
    slide_2.png
    ...
```

---

## 타입스크립트 타입 정의

```typescript
// 역할
type UserRole = 'presenter' | 'reviewer';

// 분석 상태
type AnalysisStatus = 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';

// 분석 타입
type AnalysisType = 'spell' | 'logic' | 'questions';

// 맞춤법 결과
interface SpellResult {
  slide: number;
  original: string;
  corrected: string;
  description: string;
}

// 논리성 결과
interface LogicResult {
  slide: number;
  issue: string;
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
}

// 예상 질문 결과
interface QuestionResult {
  question: string;
  category: '방법론' | '보안' | '실험' | '기타';
  difficulty: 'easy' | 'medium' | 'hard';
}

// DB 엔티티
interface Profile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

interface Presentation {
  id: string;
  uploader_id: string;
  title: string;
  file_path: string;
  slide_count: number | null;
  status: AnalysisStatus;
  created_at: string;
}

interface Slide {
  id: string;
  presentation_id: string;
  slide_number: number;
  thumbnail_path: string | null;
  text_content: string | null;
}

interface AnalysisResult {
  id: string;
  presentation_id: string;
  type: AnalysisType;
  result_json: SpellResult[] | LogicResult[] | QuestionResult[];
  created_at: string;
}

interface Feedback {
  id: string;
  slide_id: string;
  reviewer_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  presentation_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
```

---

## Supabase SQL (마이그레이션)

```sql
-- 사용자 프로필
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
  file_path     TEXT NOT NULL,
  slide_count   INTEGER,
  status        TEXT DEFAULT 'PENDING'
                CHECK (status IN ('PENDING','ANALYZING','COMPLETED','FAILED')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 슬라이드
CREATE TABLE slides (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id   UUID REFERENCES presentations(id) ON DELETE CASCADE,
  slide_number      INTEGER NOT NULL,
  thumbnail_path    TEXT,
  text_content      TEXT
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

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedbacks_updated_at
  BEFORE UPDATE ON feedbacks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: profiles
CREATE POLICY "profiles: 인증 사용자 조회" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles: 본인만 수정" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles: 회원가입시 삽입" ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- RLS 정책: presentations
CREATE POLICY "presentations: 인증 사용자 조회" ON presentations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "presentations: presenter만 업로드" ON presentations
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'presenter'
  );
CREATE POLICY "presentations: 본인만 삭제" ON presentations
  FOR DELETE TO authenticated USING (uploader_id = auth.uid());

-- RLS 정책: slides
CREATE POLICY "slides: 인증 사용자 조회" ON slides
  FOR SELECT TO authenticated USING (true);

-- RLS 정책: analysis_results
CREATE POLICY "analysis_results: 인증 사용자 조회" ON analysis_results
  FOR SELECT TO authenticated USING (true);

-- RLS 정책: feedbacks
CREATE POLICY "feedbacks: 인증 사용자 조회" ON feedbacks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "feedbacks: reviewer만 작성" ON feedbacks
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'reviewer'
    AND reviewer_id = auth.uid()
  );
CREATE POLICY "feedbacks: 본인만 수정/삭제" ON feedbacks
  FOR ALL TO authenticated USING (reviewer_id = auth.uid());

-- RLS 정책: notifications
CREATE POLICY "notifications: 본인만 조회" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications: 본인만 읽음 처리" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
```
