# 프로젝트 구조 정의서 (Structure)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼

---

## 전체 모노레포 구조

```
seminar-feedback-platform/
├── nextjs-app/               # Next.js 14 프론트엔드
├── fastapi-backend/          # FastAPI Python 백엔드
├── docs/                     # 프로젝트 문서
│   ├── 01-plan/              # Phase 1-2 산출물
│   ├── 02-design/            # Phase 3-5 산출물
│   ├── 03-analysis/          # Phase 7-8 산출물
│   └── 04-report/            # Phase 9 산출물
├── CLAUDE.md                 # Claude 프로젝트 가이드
├── CONVENTIONS.md            # 코딩 컨벤션
└── seminar_feedback_requirements.md
```

---

## Next.js App 구조

```
nextjs-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 인증 그룹 (공통 레이아웃 없음)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── presentations/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── api/                      # Next.js API Routes
│   │   │   ├── presentations/
│   │   │   │   ├── route.ts          # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET
│   │   │   ├── feedbacks/
│   │   │   │   ├── route.ts          # POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # PUT, DELETE
│   │   │   └── notifications/
│   │   │       ├── route.ts          # GET
│   │   │       └── [id]/
│   │   │           └── route.ts      # PATCH
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # 랜딩 페이지
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── AppLayout.tsx
│   │   └── shared/                   # 공통 컴포넌트
│   │       ├── AnalysisBadge.tsx     # 분석 상태 뱃지
│   │       ├── LoadingSpinner.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── features/                     # 기능별 모듈
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── presentations/
│   │   │   ├── PresentationCard.tsx
│   │   │   ├── PresentationList.tsx
│   │   │   └── UploadDropzone.tsx
│   │   ├── slides/
│   │   │   ├── SlideViewer.tsx
│   │   │   └── SlideThumbnail.tsx
│   │   ├── analysis/
│   │   │   ├── SpellTab.tsx
│   │   │   ├── LogicTab.tsx
│   │   │   └── QuestionsTab.tsx
│   │   ├── feedbacks/
│   │   │   ├── FeedbackPanel.tsx
│   │   │   ├── FeedbackForm.tsx
│   │   │   └── FeedbackItem.tsx
│   │   └── notifications/
│   │       ├── NotificationBell.tsx
│   │       └── NotificationItem.tsx
│   │
│   ├── hooks/                        # 커스텀 훅
│   │   ├── use-auth.ts
│   │   ├── use-presentations.ts
│   │   ├── use-presentation.ts
│   │   ├── use-slides.ts
│   │   ├── use-analysis.ts
│   │   ├── use-feedbacks.ts
│   │   └── use-notifications.ts
│   │
│   ├── lib/                          # 인프라 레이어
│   │   ├── supabase/
│   │   │   ├── client.ts             # 브라우저 클라이언트
│   │   │   └── server.ts             # 서버 클라이언트
│   │   └── api/
│   │       └── fastapi-client.ts     # FastAPI 호출 클라이언트
│   │
│   ├── types/                        # 타입 정의
│   │   ├── database.types.ts         # Supabase 자동 생성 타입
│   │   └── app.types.ts              # 앱 도메인 타입
│   │
│   └── utils/                        # 순수 유틸리티
│       ├── constants.ts
│       ├── format-date.ts
│       └── parse-gemini-json.ts      # ```json 펜스 제거 유틸
│
├── public/
├── .env.local                        # 로컬 환경변수 (Git 제외)
├── .env.example                      # 환경변수 템플릿
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## FastAPI Backend 구조

```
fastapi-backend/
├── app/
│   ├── main.py                       # FastAPI 앱 + 라우터 등록
│   ├── routes/
│   │   └── analyze.py                # POST /analyze, GET /health
│   ├── services/
│   │   ├── pptx_service.py           # python-pptx 텍스트/썸네일 추출
│   │   ├── gemini_service.py         # Gemini API 호출 (재시도 로직)
│   │   └── supabase_service.py       # Supabase Storage/DB 연동
│   └── models/
│       └── schemas.py                # Pydantic 모델 (요청/응답)
├── requirements.txt
├── .env                              # 로컬 환경변수 (Git 제외)
├── .env.example
└── render.yaml                       # Render 배포 설정
```

---

## 레이어 의존 방향

```
app/ (페이지)
  ↓
features/ (기능 컴포넌트)
  ↓
hooks/ (상태 관리)
  ↓
lib/ (Supabase/API 클라이언트)
  ↓
Supabase / FastAPI (외부 서비스)
```

**규칙**: 상위 레이어는 하위 레이어를 참조할 수 있지만, 하위 레이어는 상위 레이어를 참조할 수 없음.
