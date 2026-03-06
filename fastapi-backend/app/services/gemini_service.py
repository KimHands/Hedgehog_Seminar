import asyncio
import json
import os
import re
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
RETRY_LIMIT = 3
DELAY_SECONDS = 1.0


def _clean_json(text: str) -> str:
    """Gemini 응답에서 ```json 마크다운 펜스를 제거합니다."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


async def _call_gemini(prompt: str) -> list:
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3},
    }
    headers = {"Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=60) as client:
        for attempt in range(1, RETRY_LIMIT + 1):
            try:
                response = await client.post(
                    f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                    json=payload,
                    headers=headers,
                )
                if response.status_code == 429:
                    await asyncio.sleep(DELAY_SECONDS * attempt)
                    continue

                response.raise_for_status()
                raw = response.json()
                text = raw["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(_clean_json(text))

            except (httpx.HTTPStatusError, json.JSONDecodeError, KeyError) as e:
                if attempt == RETRY_LIMIT:
                    print(f"[GEMINI ERROR] {e}")
                    return []
                await asyncio.sleep(DELAY_SECONDS)

    return []


async def check_spell(slides: list[dict]) -> list:
    text_lines = "\n".join(
        f"[슬라이드 {s['slide_number']}]\n{s['text_content']}"
        for s in slides if s["text_content"]
    )
    prompt = f"""너는 한국어 맞춤법 전문가야.
아래 발표 슬라이드 텍스트에서 맞춤법/문법 오류를 찾아줘.

[텍스트]
{text_lines}

반드시 다음 JSON 배열 형식으로만 응답해. 다른 설명은 하지 마.
[{{"slide": 슬라이드번호, "original": "오류 원문", "corrected": "수정안", "description": "설명"}}]
오류가 없으면 빈 배열 []을 반환해."""
    await asyncio.sleep(DELAY_SECONDS)
    return await _call_gemini(prompt)


async def check_logic(slides: list[dict]) -> list:
    slides_text = "\n".join(
        f"[슬라이드 {s['slide_number']}]\n{s['text_content']}"
        for s in slides if s["text_content"]
    )
    prompt = f"""너는 정보보안 분야 연구 발표 심사위원이야.
아래 발표 슬라이드 내용의 논리적 흐름과 주장의 근거 적절성을 검토해줘.

[슬라이드 내용]
{slides_text}

반드시 다음 JSON 배열 형식으로만 응답해. 다른 설명은 하지 마.
[{{"slide": 슬라이드번호, "issue": "문제점", "suggestion": "개선안", "severity": "high|medium|low"}}]
문제가 없으면 빈 배열 []을 반환해."""
    await asyncio.sleep(DELAY_SECONDS)
    return await _call_gemini(prompt)


async def generate_questions(slides: list[dict]) -> list:
    slides_text = "\n".join(
        f"[슬라이드 {s['slide_number']}]\n{s['text_content']}"
        for s in slides if s["text_content"]
    )
    prompt = f"""너는 정보보안 연구실 세미나에서 발표를 듣는 연구원이야.
아래 발표 내용을 읽고 발표자에게 실제로 할 법한 심층 질문 10개를 생성해줘.

[발표 내용]
{slides_text}

반드시 다음 JSON 배열 형식으로만 응답해. 다른 설명은 하지 마.
[{{"question": "질문 내용", "category": "방법론|보안|실험|기타", "difficulty": "easy|medium|hard"}}]"""
    await asyncio.sleep(DELAY_SECONDS)
    return await _call_gemini(prompt)


async def run_all_analyses(slides: list[dict]) -> dict:
    """맞춤법·논리성·예상질문을 순차 실행 (rate limit 대응)."""
    spell = await check_spell(slides)
    logic = await check_logic(slides)
    questions = await generate_questions(slides)
    return {"spell": spell, "logic": logic, "questions": questions}
