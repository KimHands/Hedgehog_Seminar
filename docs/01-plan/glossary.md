# 용어 정의서 (Glossary)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼
> Phase: 1 - Schema/Terminology

---

## 비즈니스 용어 (Business Terms)

| 한국어 | 영어 (코드) | 정의 | 글로벌 표준 매핑 |
|--------|------------|------|----------------|
| 발표자 | Presenter | PPTX 파일을 업로드하고 피드백을 받는 연구실 구성원 | User (role=presenter) |
| 피드백 진행자 | Reviewer | 슬라이드별 피드백을 작성하는 연구실 구성원 | User (role=reviewer) |
| 발표 자료 | Presentation | 발표자가 업로드한 PPTX 파일과 분석 결과의 묶음 | Document, Resource |
| 슬라이드 | Slide | PPTX 내 개별 페이지 단위 | Page |
| 피드백 | Feedback | 피드백 진행자가 슬라이드별로 작성하는 의견 | Comment, Review |
| 자동 분석 | Analysis | Gemini API를 통해 자동으로 수행되는 맞춤법/논리성/예상질문 분석 | AI Analysis |
| 맞춤법 검사 | Spell Check | 슬라이드 텍스트의 한국어 맞춤법 오류 탐지 | Spell Analysis |
| 논리성 검사 | Logic Check | 슬라이드 흐름과 주장의 논리적 정합성 검토 | Logic Analysis |
| 예상 질문 | Expected Questions | Gemini가 청중 시각에서 생성한 심층 질문 목록 | Q&A Generation |
| 알림 | Notification | 발표자 업로드 시 피드백 진행자에게 발송되는 인앱 알림 | Notification |
| 분석 상태 | Analysis Status | 발표 자료의 처리 단계 (PENDING/ANALYZING/COMPLETED/FAILED) | Status, State |
| 썸네일 | Thumbnail | Pillow로 생성된 슬라이드 미리보기 이미지 | Preview Image |

---

## 글로벌 표준 용어 (Global Standards)

| 용어 | 정의 | 참고 |
|------|------|------|
| UUID | 범용 고유 식별자 | RFC 4122 |
| RLS | Row Level Security - Supabase 행 수준 보안 정책 | Supabase Docs |
| JWT | JSON Web Token - 인증 토큰 | RFC 7519 |
| PPTX | Microsoft PowerPoint Open XML 파일 형식 | OOXML |
| REST | RESTful API 아키텍처 스타일 | - |
| JSONB | PostgreSQL JSON Binary 타입 | PostgreSQL Docs |
| Realtime | Supabase WebSocket 기반 실시간 이벤트 구독 | Supabase Docs |
| Free Tier | 무료 사용 한도 (Gemini API, Supabase, Vercel, Render) | 각 플랫폼 |

---

## 역할 정의 (Role Definitions)

| 역할 | 코드값 | 권한 |
|------|--------|------|
| 발표자 | `presenter` | PPTX 업로드, 본인 자료 분석 결과 열람, 피드백 열람 |
| 피드백 진행자 | `reviewer` | 모든 발표 자료 열람, 슬라이드별 피드백 CRUD, 알림 수신 |

---

## 분석 상태 정의 (Analysis Status)

| 상태 | 코드값 | 설명 |
|------|--------|------|
| 대기 중 | `PENDING` | 업로드 완료, FastAPI 처리 대기 |
| 분석 중 | `ANALYZING` | FastAPI에서 Gemini API 호출 진행 중 |
| 완료 | `COMPLETED` | 분석 결과 저장 완료 |
| 실패 | `FAILED` | 분석 중 오류 발생 (재시도 가능) |

---

## 분석 타입 정의 (Analysis Types)

| 타입 | 코드값 | Gemini 역할 |
|------|--------|------------|
| 맞춤법 | `spell` | 한국어 맞춤법 전문가 |
| 논리성 | `logic` | 정보보안 분야 연구 발표 심사위원 |
| 예상 질문 | `questions` | 정보보안 연구실 세미나 연구원 |

---

## 코드 규칙 (Code Rules)

1. 코드에서는 **영어** 사용 (`Presenter`, `Reviewer`, `Presentation`)
2. UI/문서에서는 **한국어** 사용 (발표자, 피드백 진행자, 발표 자료)
3. API 응답은 **snake_case** (예: `presentation_id`, `slide_number`)
4. 컴포넌트/타입은 **PascalCase** (예: `PresentationCard`, `SlideViewer`)
5. 상수/enum은 **UPPER_SNAKE_CASE** (예: `PENDING`, `ANALYZING`)
