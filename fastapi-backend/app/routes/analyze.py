import asyncio
from fastapi import APIRouter, BackgroundTasks
from app.models.schemas import AnalyzeRequest
from app.services import pptx_service, gemini_service, supabase_service

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/analyze")
async def analyze(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_analysis, request)
    return {"message": "분석이 시작되었습니다.", "presentation_id": request.presentation_id}


async def _run_analysis(req: AnalyzeRequest):
    client = supabase_service.get_client(req.supabase_url, req.supabase_key)

    try:
        supabase_service.update_presentation_status(client, req.presentation_id, "ANALYZING")
        print(f"[ANALYZE] START presentation_id={req.presentation_id}")

        # 1. PPTX 다운로드
        pptx_bytes = await supabase_service.download_pptx(client, req.file_path)
        print(f"[ANALYZE] PPTX downloaded: {len(pptx_bytes)} bytes")

        # 2. 슬라이드 텍스트 추출
        slides = pptx_service.extract_slides(pptx_bytes)
        print(f"[ANALYZE] Extracted {len(slides)} slides")

        # 3. 썸네일 생성 및 업로드
        slide_records = []
        for slide in slides:
            thumbnail_bytes = pptx_service.generate_thumbnail(pptx_bytes, slide["slide_number"])
            thumbnail_path = await supabase_service.upload_thumbnail(
                client, req.presentation_id, slide["slide_number"], thumbnail_bytes
            )
            slide_records.append({
                "presentation_id": req.presentation_id,
                "slide_number": slide["slide_number"],
                "thumbnail_path": thumbnail_path,
                "text_content": slide["text_content"],
            })

        supabase_service.save_slides(client, slide_records)
        supabase_service.update_presentation_status(
            client, req.presentation_id, "ANALYZING", slide_count=len(slides)
        )
        print(f"[ANALYZE] Slides saved, thumbnails uploaded")

        # 4. Gemini API 분석 (순차 실행 - rate limit 대응)
        results = await gemini_service.run_all_analyses(slides)
        print(f"[ANALYZE] Gemini analysis done: spell={len(results['spell'])}, logic={len(results['logic'])}, questions={len(results['questions'])}")

        # 5. 분석 결과 저장
        for analysis_type, result_json in results.items():
            supabase_service.save_analysis_result(client, req.presentation_id, analysis_type, result_json)

        # 6. 완료 상태 업데이트
        supabase_service.update_presentation_status(client, req.presentation_id, "COMPLETED")

        # 7. 알림 생성
        title_result = client.table("presentations").select("title").eq("id", req.presentation_id).single().execute()
        title = title_result.data.get("title", "발표 자료")
        supabase_service.create_notifications(
            client,
            req.presentation_id,
            f"'{title}' 발표 자료 분석이 완료되었습니다.",
        )
        print(f"[ANALYZE] COMPLETED presentation_id={req.presentation_id}")

    except Exception as e:
        print(f"[ANALYZE ERROR] {e}")
        supabase_service.update_presentation_status(client, req.presentation_id, "FAILED")
