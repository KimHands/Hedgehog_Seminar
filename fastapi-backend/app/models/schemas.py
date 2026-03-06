from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    presentation_id: str
    file_path: str
    supabase_url: str
    supabase_key: str
