/**
 * 입력값 검증 유틸리티 (서버 사이드 전용)
 * XSS 방어 및 SQL Injection 방어를 위한 기본 검증
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

export function isNonEmptyString(value: unknown, maxLength = 5000): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

export function isValidFilePath(value: unknown): value is string {
  if (typeof value !== 'string') return false
  // Supabase Storage 경로 형식만 허용 (path traversal 방어)
  return /^[a-zA-Z0-9_\-/.]+\.pptx$/.test(value) && !value.includes('..')
}

export function sanitizeString(value: string): string {
  // HTML 특수문자 이스케이프 (XSS 방어)
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
