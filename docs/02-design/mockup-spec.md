# 목업 스펙 (Mockup Specification)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼
> Phase: 3 - Mockup Development

---

## 목업 파일 위치

```
mockup/
├── pages/index.html       ← 전체 화면 통합 목업 (하단 네비게이션으로 전환)
├── styles/main.css        ← CSS 디자인 토큰 + 컴포넌트 스타일
└── data/mock-data.json    ← 목업 데이터 (API 응답 구조)
```

---

## 화면 목록

| 화면 | URL (실제) | 목업 ID | 접근 권한 |
|------|-----------|---------|----------|
| 랜딩 | `/` | `screen-landing` | 비인증 |
| 로그인 | `/login` | `screen-login` | 비인증 |
| 회원가입 | `/signup` | `screen-signup` | 비인증 |
| 대시보드 | `/dashboard` | `screen-dashboard` | 인증 전체 |
| 업로드 | `/upload` | `screen-upload` | presenter |
| 발표 상세 | `/presentations/[id]` | `screen-detail` | 인증 전체 |
| 알림 | `/notifications` | `screen-notifications` | 인증 전체 |

---

## 디자인 토큰 (CSS Variables)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--primary-500` | `#3B82F6` | 메인 액션 |
| `--primary-600` | `#2563EB` | hover 상태 |
| `--primary-900` | `#1E3A5F` | 강조 |
| `--success` | `#10B981` | 성공/완료 |
| `--warning` | `#F59E0B` | 경고 |
| `--error` | `#EF4444` | 오류/실패 |
| `--bg-base` | `#F8FAFC` / `#0F172A` | 페이지 배경 |
| `--bg-surface` | `#FFFFFF` / `#1E293B` | 카드/패널 배경 |
| `--border` | `#E2E8F0` / `#334155` | 테두리 |

---

## 컴포넌트 → Next.js 매핑

| 목업 클래스 | Next.js 컴포넌트 위치 | Props |
|------------|---------------------|-------|
| `.header` | `components/layout/Header.tsx` | `user`, `notifCount` |
| `.sidebar` | `components/layout/Sidebar.tsx` | `role`, `activeItem` |
| `.presentation-card` | `features/presentations/PresentationCard.tsx` | `presentation` |
| `.badge` + status | `components/shared/AnalysisBadge.tsx` | `status: AnalysisStatus` |
| `.upload-area` | `features/presentations/UploadDropzone.tsx` | `onFileSelect`, `maxSizeMB` |
| `.slide-thumb-item` | `features/slides/SlideThumbnail.tsx` | `slide`, `isActive`, `onClick` |
| `.analysis-tabs` | `features/analysis/AnalysisTabs.tsx` | `presentationId`, `slideId` |
| `.spell-item` | `features/analysis/SpellTab.tsx` | `results: SpellResult[]` |
| `.logic-item` | `features/analysis/LogicTab.tsx` | `results: LogicResult[]` |
| `.question-item` | `features/analysis/QuestionsTab.tsx` | `results: QuestionResult[]` |
| `.feedback-item` | `features/feedbacks/FeedbackItem.tsx` | `feedback`, `currentUserId` |
| `.feedback-form` | `features/feedbacks/FeedbackForm.tsx` | `slideId`, `onSubmit` |
| `.notification-item` | `features/notifications/NotificationItem.tsx` | `notification`, `onClick` |
| `.role-option` | `features/auth/SignupForm.tsx` | 내부 상태 |

---

## 레이아웃 구조

### App Layout (대시보드 이후 모든 페이지)
```
┌─────────────────────────────────────────┐
│  Header (64px): 로고 | 알림벨 | 유저메뉴  │
├──────────┬──────────────────────────────┤
│ Sidebar  │  Main Content               │
│ (240px)  │                             │
│          │                             │
└──────────┴──────────────────────────────┘
```

### Presentation Detail Layout
```
┌─────────────────────────────────────────┐
│  Header (← 뒤로 | 제목 | 뱃지 | 유저)   │
├────────────────┬────────────────────────┤
│ 슬라이드 목록  │ 슬라이드 뷰어 (16:9)   │
│ (220px)       │                        │
│ 썸네일 세로   ├────────────────────────┤
│ 스크롤        │ 탭: 피드백|맞춤법|논리  │
│               │      |예상질문         │
│               ├────────────────────────┤
│               │ 피드백 입력 폼         │
└───────────────┴────────────────────────┘
```

---

## 분석 상태 뱃지 스펙

| 상태 | 클래스 | 텍스트 | 아이콘 |
|------|--------|--------|--------|
| PENDING | `.badge-pending` | 대기 중 | 없음 |
| ANALYZING | `.badge-analyzing` | 분석 중... | 스피너 (CSS animation) |
| COMPLETED | `.badge-completed` | ✓ 완료 | ✓ |
| FAILED | `.badge-failed` | 실패 | 없음 + 재시도 버튼 |

---

## 인터랙션 목록

| 인터랙션 | 구현 방식 | Next.js 전환 시 |
|---------|----------|----------------|
| 화면 전환 | JS `showScreen()` | Next.js `router.push()` |
| 역할 선택 | JS `selectRole()` | `useState` |
| 탭 전환 | JS `switchTab()` | `useState` + 조건부 렌더링 |
| 슬라이드 선택 | JS `selectSlide()` | `useState(selectedSlideId)` |
| 파일 업로드 시뮬레이션 | JS `simulateUpload()` | Supabase Storage + 프로그레스 |
| 드래그앤드롭 | `ondragover`, `ondrop` | `react-dropzone` 또는 네이티브 |

---

## 검증된 사항 (Phase 3 완료 기준)

- [x] 모든 페이지 화면 구성 확인
- [x] 역할별 UI 차이 확인 (발표자/피드백 진행자)
- [x] 분석 상태 4가지 뱃지 표현
- [x] 발표 상세 4개 탭 구조 확인
- [x] 피드백 CRUD UI 확인
- [x] 알림 읽음/미읽음 구분 확인
- [x] 업로드 진행률 UI 확인
- [x] Light/Dark mode 대응 (CSS 미디어 쿼리)
