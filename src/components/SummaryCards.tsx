import type { ParticipantComputed } from '../types'
import { formatMoney } from '../utils/money'

interface SummaryCardsProps {
  participants: ParticipantComputed[]
  currency: string
}

export function SummaryCards({ participants, currency }: SummaryCardsProps) {
  const totalDue = participants.reduce((s, p) => s + p.totalDue, 0)
  const totalPaid = participants.reduce((s, p) => s + p.paid, 0)
  const left = Math.max(0, totalDue - totalPaid)
  const fullCount = participants.filter((p) => p.status === 'full').length
  const oweCount = participants.filter((p) => p.status !== 'full').length

  const cards = [
    { label: 'Всего нужно собрать', value: formatMoney(totalDue, currency), tone: 'slate' as const },
    { label: 'Уже собрано', value: formatMoney(totalPaid, currency), tone: 'emerald' as const },
    { label: 'Осталось собрать', value: formatMoney(left, currency), tone: 'red' as const },
    { label: 'Полностью оплатили', value: String(fullCount), tone: 'emerald' as const },
    { label: 'Ещё должны', value: String(oweCount), tone: 'amber' as const },
  ]

  const toneCls = {
    slate: 'border-slate-200 bg-white',
    emerald: 'border-emerald-200 bg-emerald-50/80',
    red: 'border-red-200 bg-red-50/80',
    amber: 'border-amber-200 bg-amber-50/80',
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-2xl border p-4 shadow-sm ${toneCls[c.tone]}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {c.label}
          </p>
          <p
            className={`mt-2 text-xl font-semibold tabular-nums ${
              c.tone === 'red' ? 'text-red-700' : 'text-slate-900'
            }`}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  )
}
