/**
 * Formatea un SID para display. Si ya tiene formato LNK-YYMM-XXXX lo devuelve tal cual.
 * Si es un UUID, genera un pseudo-SID para display basado en los primeros 8 caracteres.
 */
export function formatSID(sid: string | null | undefined): string {
  if (!sid) return '—'
  if (sid.startsWith('LNK-')) return sid
  // Fallback: mostrar UUID truncado con prefijo
  return `LNK-${sid.slice(0, 8).toUpperCase()}`
}
