import type { AppData, Participant, Payment } from '../types'
import { formatRuDate } from './dates'
import { createId } from './id'
import { computeParticipant } from './participantLogic'
import { DEFAULT_SETTINGS } from '../constants'

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Экспорт: участники с расчётными полями + таблица платежей */
export function exportToCsv(data: AppData): string {
  const lines: string[] = []
  lines.push('УЧАСТНИКИ')
  lines.push(
    [
      'id',
      'Фамилия',
      'Имя',
      'Сумма к оплате',
      'Внесено',
      'Остаток',
      'Статус',
      'Дата полной оплаты',
    ].join(',')
  )
  for (const pr of data.participants) {
    const c = computeParticipant(pr, data.payments)
    const st =
      c.status === 'full'
        ? 'Полностью оплатил'
        : c.status === 'partial'
          ? 'Частично оплатил'
          : 'Не начал'
    lines.push(
      [
        escapeCsv(pr.id),
        escapeCsv(pr.lastName),
        escapeCsv(pr.firstName ?? ''),
        String(pr.totalDue),
        String(c.paid),
        String(c.remainder),
        escapeCsv(st),
        escapeCsv(c.fullPaymentDate ?? ''),
      ].join(',')
    )
  }
  lines.push('')
  lines.push('ПЛАТЕЖИ')
  lines.push(['id', 'id участника', 'Дата', 'Сумма', 'Комментарий'].join(','))
  const pays = [...data.payments].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  for (const p of pays) {
    lines.push(
      [
        escapeCsv(p.id),
        escapeCsv(p.participantId),
        escapeCsv(formatRuDate(p.date)),
        String(p.amount),
        escapeCsv(p.comment ?? ''),
      ].join(',')
    )
  }
  return '\uFEFF' + lines.join('\n')
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export function importFromJson(text: string): AppData | null {
  try {
    const p = JSON.parse(text) as AppData
    if (!Array.isArray(p.participants) || !Array.isArray(p.payments)) return null
    return {
      participants: p.participants as Participant[],
      payments: p.payments as Payment[],
      settings: {
        currency: String(p.settings?.currency ?? DEFAULT_SETTINGS.currency),
        defaultAmount: Number(p.settings?.defaultAmount) || 0,
      },
    }
  } catch {
    return null
  }
}

export function importFromCsv(text: string): AppData | null {
  const normalized = text.replace(/^\uFEFF/, '')
  const lines = normalized.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length === 0) return null

  const lower0 = lines[0].toLowerCase()
  if (lower0.includes('участники') || lower0 === 'участники') {
    return parseStructuredCsv(lines)
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
  const idxFam = findCol(header, ['фамилия', 'lastname', 'last'])
  const idxName = findCol(header, ['имя', 'firstname', 'first', 'имя / отчество'])
  const idxSum = findCol(header, ['сумма', 'total', 'к оплате', 'сумма к оплате'])
  if (idxFam >= 0 && idxSum >= 0) {
    const participants: Participant[] = []
    for (let i = 1; i < lines.length; i++) {
      const row = splitCsvLine(lines[i])
      const lastName = row[idxFam]?.trim()
      if (!lastName) continue
      const totalDue = Number(String(row[idxSum] ?? '').replace(/\s/g, '').replace(',', '.'))
      participants.push({
        id: createId(),
        lastName,
        firstName: idxName >= 0 ? row[idxName]?.trim() || undefined : undefined,
        totalDue: Number.isFinite(totalDue) ? totalDue : 0,
      })
    }
    return {
      participants,
      payments: [],
      settings: { ...DEFAULT_SETTINGS },
    }
  }

  return parseStructuredCsv(lines)
}

function findCol(header: string[], keys: string[]): number {
  for (let i = 0; i < header.length; i++) {
    const h = header[i].replace(/\s+/g, ' ').trim()
    for (const k of keys) {
      if (h.toLowerCase() === k.toLowerCase()) return i
    }
  }
  return -1
}

function parseStructuredCsv(lines: string[]): AppData | null {
  let section: 'none' | 'participants' | 'payments' = 'none'
  const participants: Participant[] = []
  const payments: Payment[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (line === 'УЧАСТНИКИ' || line.toUpperCase() === 'УЧАСТНИКИ') {
      section = 'participants'
      continue
    }
    if (line === 'ПЛАТЕЖИ' || line.toUpperCase() === 'ПЛАТЕЖИ') {
      section = 'payments'
      continue
    }

    const cells = splitCsvLine(line)
    if (section === 'participants') {
      if (cells[0] === 'id' || cells.join(',').includes('Фамилия')) continue
      if (cells.length < 4) continue
      const id = cells[0] || createId()
      const lastName = cells[1] ?? ''
      if (!lastName) continue
      participants.push({
        id,
        lastName,
        firstName: cells[2] || undefined,
        totalDue: Number(cells[3]) || 0,
      })
    } else if (section === 'payments') {
      if (cells[0] === 'id' || cells.join(',').includes('id участника')) continue
      if (cells.length < 4) continue
      const payId = cells[0] || createId()
      const participantId = cells[1]
      const dateRu = cells[2]
      const amount = Number(cells[3])
      const comment = cells[4]
      const iso = ruDateToIso(dateRu)
      if (!participantId || !iso) continue
      payments.push({
        id: payId,
        participantId,
        date: iso,
        amount: Number.isFinite(amount) ? amount : 0,
        comment: comment || undefined,
      })
    }
  }

  if (participants.length === 0 && payments.length === 0) return null

  return {
    participants,
    payments,
    settings: { ...DEFAULT_SETTINGS },
  }
}

function ruDateToIso(s: string): string | null {
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (!m) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    return null
  }
  const d = Number(m[1])
  const mo = Number(m[2])
  const y = Number(m[3])
  const mm = String(mo).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}
