-- ============================================================
-- 세미나 피드백 플랫폼 초기 마이그레이션
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

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

-- ============================================================
-- RLS 활성화
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 정책
-- ============================================================

-- profiles
CREATE POLICY "profiles: 인증 사용자 조회" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles: 본인만 수정" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles: 회원가입시 삽입" ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- presentations
CREATE POLICY "presentations: 인증 사용자 조회" ON presentations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "presentations: presenter만 업로드" ON presentations
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'presenter'
  );
CREATE POLICY "presentations: 본인만 삭제" ON presentations
  FOR DELETE TO authenticated USING (uploader_id = auth.uid());

-- slides
CREATE POLICY "slides: 인증 사용자 조회" ON slides
  FOR SELECT TO authenticated USING (true);

-- analysis_results
CREATE POLICY "analysis_results: 인증 사용자 조회" ON analysis_results
  FOR SELECT TO authenticated USING (true);

-- feedbacks
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

-- notifications
CREATE POLICY "notifications: 본인만 조회" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications: 본인만 읽음 처리" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
