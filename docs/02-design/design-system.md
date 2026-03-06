# 디자인 시스템 (Design System)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼
> Phase: 5 - Design System

---

## 디자인 토큰

| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `--primary` | `217 91% 60%` (#3B82F6) | 동일 | 메인 액션 |
| `--background` | `210 40% 98%` (#F8FAFC) | `222 84% 5%` (#0F172A) | 페이지 배경 |
| `--card` | `0 0% 100%` (#FFFFFF) | `217 33% 17%` (#1E293B) | 카드/패널 |
| `--border` | `214 32% 91%` (#E2E8F0) | `217 33% 26%` (#334155) | 테두리 |
| `--success` | `160 84% 39%` (#10B981) | 동일 | 완료 상태 |
| `--warning` | `38 92% 50%` (#F59E0B) | 동일 | 경고 |
| `--destructive` | `0 84% 60%` (#EF4444) | 동일 | 오류/삭제 |
| `--radius` | `0.5rem` | - | 기본 radius |
| `--header-height` | `64px` | - | 헤더 높이 |
| `--sidebar-width` | `240px` | - | 사이드바 너비 |

---

## 컴포넌트 카탈로그

### UI 기본 컴포넌트 (shadcn/ui 커스텀)

| 컴포넌트 | 파일 | Variants |
|---------|------|----------|
| Button | `components/ui/button.tsx` | default, outline, ghost, destructive, secondary, link + sm/lg/icon |
| Badge | `components/ui/badge.tsx` | default, secondary, success, warning, destructive, outline |
| Card | `components/ui/card.tsx` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Tabs | `components/ui/tabs.tsx` | TabsList, TabsTrigger, TabsContent |
| Input | `components/ui/input.tsx` | 기본 |
| Textarea | `components/ui/textarea.tsx` | 기본 |

### 프로젝트 공유 컴포넌트

| 컴포넌트 | 파일 | Props |
|---------|------|-------|
| AnalysisBadge | `components/shared/AnalysisBadge.tsx` | `status: AnalysisStatus` |
| EmptyState | `components/shared/EmptyState.tsx` | `icon, title, description, action` |

### 레이아웃 컴포넌트

| 컴포넌트 | 파일 | Props |
|---------|------|-------|
| AppLayout | `components/layout/AppLayout.tsx` | `children` |
| Header | `components/layout/Header.tsx` | `userName, unreadCount` |
| Sidebar | `components/layout/Sidebar.tsx` | `role` |

---

## AnalysisBadge 스펙

| status | 색상 | 텍스트 | 아이콘 |
|--------|------|--------|--------|
| PENDING | secondary (회색) | 대기 중 | 없음 |
| ANALYZING | primary (파란색) | 분석 중... | 스피너 |
| COMPLETED | success (초록) | 완료 | ✓ |
| FAILED | destructive (빨강) | 실패 | 없음 |

---

## 폰트

- Pretendard Variable (CDN): 한국어 최적화, 가변 폰트
- CSS 변수: `--font-pretendard`
- Tailwind: `font-sans` → Pretendard

---

## 다크모드

- `next-themes`로 시스템 설정 자동 감지
- `tailwind.config.ts`의 `darkMode: ['class']`
- globals.css `.dark { ... }` 오버라이드
