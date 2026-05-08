import * as XLSX from 'xlsx'
import type { AppData } from '../types'
import { formatRuDate } from './dates'
import { computeParticipant } from './participantLogic'

/** Файл .xlsx с листами «Участники» и «Платежи» (те же данные, что в CSV). */
export function exportToExcelBlob(data: AppData): Blob {
  const wb = XLSX.utils.book_new()

  const participantRows: (string | number)[][] = [
    [
      'id',
      'Фамилия',
      'Имя',
      'Сумма к оплате',
      'Внесено',
      'Остаток',
      'Статус',
      'Дата полной оплаты',
    ],
  ]
  for (const pr of data.participants) {
    const c = computeParticipant(pr, data.payments)
    const st =
      c.status === 'full'
        ? 'Полностью оплатил'
        : c.status === 'partial'
          ? 'Частично оплатил'
          : 'Не начал'
    participantRows.push([
      pr.id,
      pr.lastName,
      pr.firstName ?? '',
      pr.totalDue,
      c.paid,
      c.remainder,
      st,
      c.fullPaymentDate ?? '',
    ])
  }
  const wsParticipants = XLSX.utils.aoa_to_sheet(participantRows)
  XLSX.utils.book_append_sheet(wb, wsParticipants, 'Участники')

  const paymentRows: (string | number)[][] = [
    ['id', 'id участника', 'Дата', 'Сумма', 'Комментарий'],
  ]
  const pays = [...data.payments].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)
  )
  for (const p of pays) {
    paymentRows.push([p.id, p.participantId, formatRuDate(p.date), p.amount, p.comment ?? ''])
  }
  const wsPayments = XLSX.utils.aoa_to_sheet(paymentRows)
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Платежи')

  const out = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
    compression: true,
  }) as Uint8Array
  return new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
