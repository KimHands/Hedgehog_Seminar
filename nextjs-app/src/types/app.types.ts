export type UserRole = 'presenter' | 'reviewer'
export type AnalysisStatus = 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED'
export type AnalysisType = 'spell' | 'logic' | 'questions'

export interface Profile {
  id: string
  name: string
  role: UserRole
  created_at: string
}

export interface Presentation {
  id: string
  uploader_id: string
  title: string
  file_path: string
  slide_count: number | null
  status: AnalysisStatus
  created_at: string
  profiles?: Profile
}

export interface Slide {
  id: string
  presentation_id: string
  slide_number: number
  thumbnail_path: string | null
  text_content: string | null
}

export interface SpellResult {
  slide: number
  original: string
  corrected: string
  description: string
}

export interface LogicResult {
  slide: number
  issue: string
  suggestion: string
  severity: 'high' | 'medium' | 'low'
}

export interface QuestionResult {
  question: string
  category: '방법론' | '보안' | '실험' | '기타'
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface AnalysisResult {
  id: string
  presentation_id: string
  type: AnalysisType
  result_json: SpellResult[] | LogicResult[] | QuestionResult[]
  created_at: string
}

export interface Feedback {
  id: string
  slide_id: string
  reviewer_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Notification {
  id: string
  user_id: string
  presentation_id: string
  message: string
  is_read: boolean
  created_at: string
  presentations?: Pick<Presentation, 'id' | 'title'>
}
