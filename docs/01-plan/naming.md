# 네이밍 규칙 (Naming Rules)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼

---

## 파일 / 폴더

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 파일 | PascalCase.tsx | `PresentationCard.tsx`, `SlideViewer.tsx` |
| 훅 파일 | kebab-case.ts | `use-presentation.ts`, `use-auth.ts` |
| 유틸리티 파일 | kebab-case.ts | `format-date.ts`, `parse-json.ts` |
| API Route | route.ts (Next.js 규칙) | `app/api/presentations/route.ts` |
| 타입 파일 | kebab-case.ts | `presentation.types.ts` |
| 상수 파일 | kebab-case.ts | `analysis-status.ts` |
| 폴더 | kebab-case | `presentation-detail/`, `slide-viewer/` |
| Python 파일 | snake_case.py | `pptx_service.py`, `gemini_service.py` |

---

## 코드 내 식별자

### TypeScript / React

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `PresentationCard`, `AnalysisBadge` |
| 함수 | camelCase | `fetchPresentation`, `uploadFile` |
| 변수 | camelCase | `slideCount`, `analysisStatus` |
| 상수 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE_BYTES`, `ANALYSIS_RETRY_LIMIT` |
| 타입 / 인터페이스 | PascalCase | `Presentation`, `AnalysisResult`, `UserRole` |
| enum | PascalCase (값은 UPPER_SNAKE_CASE) | `AnalysisStatus.PENDING` |
| 훅 | camelCase + `use` 접두사 | `usePresentation`, `useNotifications` |
| 이벤트 핸들러 | `handle` + 동작명 | `handleUpload`, `handleFeedbackSubmit` |
| Boolean 변수 | `is` / `has` / `can` 접두사 | `isLoading`, `hasError`, `canDelete` |

### Python

| 대상 | 규칙 | 예시 |
|------|------|------|
| 함수 / 변수 | snake_case | `extract_text`, `slide_count` |
| 클래스 | PascalCase | `GeminiService`, `PptxProcessor` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `GEMINI_DELAY_SECONDS` |
| 타입 힌트 | PascalCase | `List[SlideData]`, `Optional[str]` |

---

## API / DB

| 대상 | 규칙 | 예시 |
|------|------|------|
| API 경로 | kebab-case, 복수형 | `/api/presentations`, `/api/feedbacks` |
| API 요청/응답 필드 | snake_case | `presentation_id`, `slide_number`, `is_read` |
| DB 테이블 | snake_case, 복수형 | `presentations`, `analysis_results` |
| DB 컬럼 | snake_case | `uploader_id`, `created_at`, `result_json` |
| Supabase Storage 경로 | kebab-case | `presentations/{id}/original.pptx` |

---

## 도메인별 주요 식별자

| 도메인 | 컴포넌트 | 훅 | 서비스 |
|--------|---------|-----|--------|
| 인증 | `LoginForm`, `SignupForm` | `useAuth` | `authService` |
| 발표 자료 | `PresentationCard`, `PresentationList` | `usePresentations`, `usePresentation` | `presentationService` |
| 슬라이드 | `SlideViewer`, `SlideThumbnail` | `useSlides` | `slideService` |
| 분석 | `AnalysisBadge`, `SpellTab`, `LogicTab`, `QuestionsTab` | `useAnalysis` | `analysisService` |
| 피드백 | `FeedbackPanel`, `FeedbackForm`, `FeedbackItem` | `useFeedbacks` | `feedbackService` |
| 알림 | `NotificationBell`, `NotificationItem` | `useNotifications` | `notificationService` |
