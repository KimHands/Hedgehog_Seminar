# API 설계서 (API Specification)

> 프로젝트: 정보보호 연구실 세미나 피드백 플랫폼
> Phase: 4 - API Design

---

## 공통 규칙

- Base URL (Next.js): `/api`
- Base URL (FastAPI): `https://your-app.onrender.com`
- 인증: Supabase JWT (Authorization: Bearer {token})
- 응답 형식: JSON
- 에러 형식: `{ "error": "메시지" }`

---

## Next.js API Routes

### Presentations

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/presentations` | 목록 조회 (역할별 필터) | 인증 전체 |
| POST | `/api/presentations` | 업로드 완료 후 DB 저장 + FastAPI 분석 트리거 | presenter |
| GET | `/api/presentations/[id]` | 상세 조회 (슬라이드 + 분석 결과 포함) | 인증 전체 |

**POST /api/presentations 요청**
```json
{ "title": "발표 제목", "file_path": "presentations/uuid/original.pptx" }
```

**POST /api/presentations 응답 201**
```json
{ "id": "uuid", "title": "발표 제목", "status": "PENDING" }
```

---

### Feedbacks

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/feedbacks` | 피드백 작성 | reviewer |
| PUT | `/api/feedbacks/[id]` | 피드백 수정 | 본인 reviewer |
| DELETE | `/api/feedbacks/[id]` | 피드백 삭제 | 본인 reviewer |

**POST /api/feedbacks 요청**
```json
{ "slide_id": "uuid", "content": "피드백 내용" }
```

---

### Notifications

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/notifications` | 본인 알림 목록 | 인증 전체 |
| PATCH | `/api/notifications/[id]` | 읽음 처리 | 본인 |

---

## FastAPI Routes (Render)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 |
| POST | `/analyze` | PPTX 분석 요청 수신 및 처리 |

**POST /analyze 요청**
```json
{
  "presentation_id": "uuid",
  "file_path": "presentations/uuid/original.pptx",
  "supabase_url": "https://xxx.supabase.co",
  "supabase_key": "service_role_key"
}
```

**FastAPI 처리 흐름**
```
1. presentations.status = 'ANALYZING'
2. Supabase Storage에서 PPTX 다운로드
3. python-pptx로 슬라이드별 텍스트 추출
4. Pillow로 슬라이드 썸네일 생성 → Storage 업로드
5. slides 테이블에 저장
6. Gemini API 병렬 호출 (1초 딜레이, 3회 재시도)
   - 맞춤법 검사 (spell)
   - 논리성 검사 (logic)
   - 예상 질문 (questions)
7. analysis_results 테이블에 저장
8. presentations.status = 'COMPLETED'
9. reviewer 전원에게 notifications 생성
```
