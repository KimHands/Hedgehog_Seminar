import io
import httpx
from supabase import create_client, Client


def get_client(url: str, key: str) -> Client:
    return create_client(url, key)


async def download_pptx(client: Client, file_path: str) -> bytes:
    response = client.storage.from_("presentations").download(file_path)
    return response


async def upload_thumbnail(client: Client, presentation_id: str, slide_number: int, image_bytes: bytes) -> str:
    path = f"{presentation_id}/slide_{slide_number}.png"
    client.storage.from_("thumbnails").upload(
        path,
        image_bytes,
        {"content-type": "image/png", "upsert": "true"},
    )
    return path


def update_presentation_status(client: Client, presentation_id: str, status: str, slide_count: int | None = None):
    data = {"status": status}
    if slide_count is not None:
        data["slide_count"] = slide_count
    client.table("presentations").update(data).eq("id", presentation_id).execute()


def save_slides(client: Client, slides: list[dict]):
    client.table("slides").insert(slides).execute()


def save_analysis_result(client: Client, presentation_id: str, analysis_type: str, result_json: list):
    client.table("analysis_results").insert({
        "presentation_id": presentation_id,
        "type": analysis_type,
        "result_json": result_json,
    }).execute()


def create_notifications(client: Client, presentation_id: str, message: str):
    reviewers = (
        client.table("profiles")
        .select("id")
        .eq("role", "reviewer")
        .execute()
    )
    if not reviewers.data:
        return

    notifications = [
        {"user_id": r["id"], "presentation_id": presentation_id, "message": message}
        for r in reviewers.data
    ]
    client.table("notifications").insert(notifications).execute()
