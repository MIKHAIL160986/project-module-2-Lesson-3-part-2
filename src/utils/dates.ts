/** ДД.ММ.ГГГГ → ГГГГ-ММ-ДД */
export function parseRuDateToIso(value: string): string | null {
  const m = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (!m) return null
  const d = Number(m[1])
  const month = Number(m[2])
  const y = Number(m[3])
  if (month < 1 || month > 12 || d < 1 || d > 31) return null
  const dt = new Date(y, month - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== month - 1 || dt.getDate() !== d) return null
  const mm = String(month).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

/** ГГГГ-ММ-ДД → ДД.ММ.ГГГГ */
export function formatRuDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

export function todayIso(): string {
  const t = new Date()
  const y = t.getFullYear()
  const mm = String(t.getMonth() + 1).padStart(2, '0')
  const dd = String(t.getDate()).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

export function compareIso(a: string, b: string): number {
  return a.localeCompare(b)
}
