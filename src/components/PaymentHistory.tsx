import type { Participant, Payment } from '../types'
import { compareIso, formatRuDate } from '../utils/dates'
import { formatMoney } from '../utils/money'

interface PaymentHistoryProps {
  open: boolean
  participant: Participant | null
  payments: Payment[]
  currency: string
  onClose: () => void
  onEdit: (payment: Payment) => void
  onDelete: (payment: Payment) => void
}

export function PaymentHistory({
  open,
  participant,
  payments,
  currency,
  onClose,
  onEdit,
  onDelete,
}: PaymentHistoryProps) {
  if (!open || !participant) return null

  const list = payments
    .filter((p) => p.participantId === participant.id)
    .sort((a, b) => -compareIso(a.date, b.date) || b.id.localeCompare(a.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
        <div className="relative border-b border-slate-100 px-6 py-4 pr-12">
          <h2 className="text-lg font-semibold text-slate-900">
            История платежей: {participant.lastName}
            {participant.firstName ? ` ${participant.firstName}` : ''}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          {list.length === 0 ? (
            <p className="text-sm text-slate-500">Платежей пока нет.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((pay) => (
                <li
                  key={pay.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 tabular-nums">
                        {formatRuDate(pay.date)}
                      </p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-800">
                        {formatMoney(pay.amount, currency)}
                      </p>
                      {pay.comment && (
                        <p className="mt-2 text-sm text-slate-600">{pay.comment}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(pay)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(pay)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
