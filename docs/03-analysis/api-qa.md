# API Zero Script QA

> Phase: 4 - API QA
> 방법: 로그 기반 검증 (테스트 스크립트 없음)

---

## 검증 항목

### Next.js API Routes

| 엔드포인트 | 검증 방법 | 예상 로그 |
|-----------|----------|----------|
| POST /api/presentations | Network 탭 → 201 응답 확인 | `{data: {id, status: "PENDING"}}` |
| GET /api/presentations | Network 탭 → 200 응답 + 역할별 필터 확인 | presenter: 본인것만, reviewer: 전체 |
| POST /api/feedbacks | reviewer 계정으로 작성 → 201 | `{data: {id, content, profiles}}` |
| PUT /api/feedbacks/[id] | 본인 피드백만 수정 가능 확인 | 타인 피드백 → 403 |
| PATCH /api/notifications/[id] | is_read: true 변경 확인 | `{data: {is_read: true}}` |

### FastAPI 로그 검증

로컬 실행: `uvicorn app.main:app --reload`

정상 흐름 로그:
```
[ANALYZE] START presentation_id=uuid
[ANALYZE] PPTX downloaded: 1234567 bytes
[ANALYZE] Extracted 24 slides
[ANALYZE] Slides saved, thumbnails uploaded
[ANALYZE] Gemini analysis done: spell=3, logic=2, questions=10
[ANALYZE] COMPLETED presentation_id=uuid
```

오류 시:
```
[ANALYZE ERROR] 오류 메시지
→ presentations.status = 'FAILED'
```

---

## 권한 검증 시나리오

| 시나리오 | 기대 결과 |
|---------|----------|
| 비인증 → 모든 API | 401 |
| presenter → POST /api/feedbacks | 403 |
| reviewer → POST /api/presentations | 403 |
| reviewer → PUT /api/feedbacks/{타인id} | 403 |
| presenter → GET /api/presentations | 본인 목록만 |
| reviewer → GET /api/presentations | 전체 목록 |

---

## Gemini 응답 파싱 검증

`_clean_json()` 함수가 아래 형식 모두 처리:
```
✅ [...] → 그대로
✅ ```json\n[...]\n``` → 펜스 제거
✅ ```\n[...]\n``` → 펜스 제거
```
