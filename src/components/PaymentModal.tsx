import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { Participant, Payment } from '../types'
import { formatRuDate, parseRuDateToIso, todayIso } from '../utils/dates'
import { sumPaymentsForParticipant } from '../utils/participantLogic'
import { formatMoney, parseMoneyInput } from '../utils/money'

interface PaymentModalProps {
  open: boolean
  currency: string
  participants: Participant[]
  payments: Payment[]
  initialParticipantId?: string | null
  editingPayment?: Payment | null
  onClose: () => void
  onSave: (payment: Omit<Payment, 'id'>) => void
}

export function PaymentModal({
  open,
  currency,
  participants,
  payments,
  initialParticipantId,
  editingPayment,
  onClose,
  onSave,
}: PaymentModalProps) {
  const [participantId, setParticipantId] = useState('')
  const [dateRu, setDateRu] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [comment, setComment] = useState('')

  const isEdit = Boolean(editingPayment)

  useEffect(() => {
    if (!open) return
    if (editingPayment) {
      setParticipantId(editingPayment.participantId)
      setDateRu(formatRuDate(editingPayment.date))
      setAmountStr(String(editingPayment.amount))
      setComment(editingPayment.comment ?? '')
    } else {
      setParticipantId(initialParticipantId ?? participants[0]?.id ?? '')
      setDateRu(formatRuDate(todayIso()))
      setAmountStr('')
      setComment('')
    }
  }, [open, editingPayment, initialParticipantId, participants])

  const selected = useMemo(
    () => participants.find((p) => p.id === participantId),
    [participants, participantId]
  )

  const remainderBefore = useMemo(() => {
    if (!selected) return 0
    const paidWithout = sumPaymentsForParticipant(selected.id, payments, editingPayment?.id)
    return Math.max(0, selected.totalDue - paidWithout)
  }, [selected, payments, editingPayment])

  if (!open) return null

  if (participants.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <p className="text-sm text-slate-700">Сначала добавьте хотя бы одного участника.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!selected) return
    const iso = parseRuDateToIso(dateRu)
    if (!iso) {
      alert('Введите дату в формате ДД.ММ.ГГГГ')
      return
    }
    const amount = parseMoneyInput(amountStr)
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Укажите положительную сумму')
      return
    }

    const paidWithout = sumPaymentsForParticipant(selected.id, payments, editingPayment?.id)
    const newPaid = paidWithout + amount
    if (newPaid > selected.totalDue) {
      const ok = window.confirm('Сумма больше остатка. Всё равно добавить?')
      if (!ok) return
    }

    onSave({
      participantId: selected.id,
      date: iso,
      amount,
      comment: comment.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingPayment ? 'Редактировать платёж' : 'Новый платёж'}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Участник
            </label>
            <select
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              disabled={isEdit}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
            >
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName}
                  {p.firstName ? ` ${p.firstName}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Дата (ДД.ММ.ГГГГ)
            </label>
            <input
              value={dateRu}
              onChange={(e) => setDateRu(e.target.value)}
              placeholder="10.05.2026"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Сумма</label>
            <input
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Комментарий
            </label>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Необязательно"
            />
          </div>
          {selected && (
            <p className="text-sm text-slate-600">
              Остаток к оплате (без этого платежа):{' '}
              <span className="font-semibold text-red-600 tabular-nums">
                {formatMoney(remainderBefore, currency)}
              </span>
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
