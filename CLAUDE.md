# 세미나 피드백 플랫폼 - 프로젝트 가이드

## 프로젝트 개요

정보보호 연구실 세미나 자료(PPTX)에 대한 자동 분석 및 동료 피드백을 제공하는 풀스택 웹 서비스.

## 기술 스택

- Frontend: Next.js 14 (App Router) + TypeScript
- UI: shadcn/ui + Tailwind CSS + Pretendard 폰트
- Backend: Supabase (Auth, PostgreSQL, Storage, Realtime)
- AI 처리: FastAPI (Python) + Gemini API (gemini-2.5-flash)
- 배포: Vercel (Next.js) + Render (FastAPI)

## 용어 참조

이 프로젝트의 비즈니스 용어는 `docs/01-plan/glossary.md`를 참조.
- 발표자 = `presenter` (코드), 피드백 진행자 = `reviewer` (코드)
- 코드에서는 영어, UI에서는 한국어 사용

## 데이터 스키마

`docs/01-plan/schema.md` 참조.
- 테이블: profiles, presentations, slides, analysis_results, feedbacks, notifications
- RLS 반드시 활성화

## 코딩 규칙

- API 응답: snake_case
- 컴포넌트/타입: PascalCase
- 상수/enum: UPPER_SNAKE_CASE
- 분석 상태: PENDING | ANALYZING | COMPLETED | FAILED

## 주의사항

- Vercel Serverless에서 PPTX 처리 금지 (10초 제한)
- 파일 업로드는 클라이언트 → Supabase Storage 직접 업로드
- Gemini API 호출 간 1초 딜레이, 최대 3회 재시도
- Gemini 응답에서 ```json 마크다운 펜스 제거 필수
- RLS 정책 반드시 적용
