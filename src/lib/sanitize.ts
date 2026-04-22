const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ESCAPES[c] ?? c)
}

const URL_SAFE = /^(https?:\/\/|mailto:|tel:|\/)/i

export function safeUrl(url: string): string {
  const trimmed = url.trim()
  if (!URL_SAFE.test(trimmed)) return '#'
  return trimmed
}

const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F]', 'g')

export function stripControlChars(s: string): string {
  return s.replace(CONTROL_CHARS, '')
}
