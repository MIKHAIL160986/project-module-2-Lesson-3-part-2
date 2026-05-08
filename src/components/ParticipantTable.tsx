import type { ParticipantComputed } from '../types'
import { formatMoney } from '../utils/money'
import { statusLabel } from '../utils/participantLogic'

interface ParticipantTableProps {
  rows: ParticipantComputed[]
  currency: string
  onAddPayment: (participantId: string) => void
  onOpenHistory: (participantId: string) => void
  onEditParticipant: (p: ParticipantComputed) => void
  onDeleteParticipant: (participantId: string) => void
}

function rowTone(status: ParticipantComputed['status']): string {
  switch (status) {
    case 'full':
      return 'bg-emerald-50/90'
    case 'partial':
      return 'bg-amber-50/90'
    case 'not_started':
      return 'bg-slate-100/80'
  }
}

function statusBadge(status: ParticipantComputed['status']): string {
  switch (status) {
    case 'full':
      return 'bg-emerald-100 text-emerald-900 ring-emerald-200'
    case 'partial':
      return 'bg-amber-100 text-amber-900 ring-amber-200'
    case 'not_started':
      return 'bg-slate-200 text-slate-800 ring-slate-300'
  }
}

function displayName(p: ParticipantComputed): string {
  return [p.lastName, p.firstName].filter(Boolean).join(' ')
}

export function ParticipantTable({
  rows,
  currency,
  onAddPayment,
  onOpenHistory,
  onEditParticipant,
  onDeleteParticipant,
}: ParticipantTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Участников пока нет. Добавьте первого выше.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-slate-700">Фамилия и имя</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Нужно сдать</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Уже сдано</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Осталось</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Статус</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Дата полной оплаты</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className={`border-b border-slate-100 ${rowTone(p.status)}`}>
                <td className="px-4 py-3 font-medium text-slate-900">{displayName(p)}</td>
                <td className="px-4 py-3 tabular-nums text-slate-800">
                  {formatMoney(p.totalDue, currency)}
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-800">
                  {formatMoney(p.paid, currency)}
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums text-red-600">
                  {formatMoney(p.remainder, currency)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusBadge(p.status)}`}
                  >
                    {statusLabel(p.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{p.fullPaymentDate ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onAddPayment(p.id)}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    >
                      Добавить платёж
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenHistory(p.id)}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      История
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditParticipant(p)}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteParticipant(p.id)}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden divide-y divide-slate-100">
        {rows.map((p) => (
          <li key={p.id} className={`p-4 ${rowTone(p.status)}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{displayName(p)}</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusBadge(p.status)}`}
                >
                  {statusLabel(p.status)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Полная оплата: {p.fullPaymentDate ?? '—'}
              </p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Нужно сдать</dt>
                <dd className="font-medium tabular-nums">{formatMoney(p.totalDue, currency)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Уже сдано</dt>
                <dd className="font-medium tabular-nums">{formatMoney(p.paid, currency)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-slate-500">Осталось</dt>
                <dd className="font-semibold tabular-nums text-red-600">
                  {formatMoney(p.remainder, currency)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAddPayment(p.id)}
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700 min-[360px]:flex-none min-[360px]:px-3"
              >
                Платёж
              </button>
              <button
                type="button"
                onClick={() => onOpenHistory(p.id)}
                className="flex-1 rounded-xl bg-white py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 min-[360px]:flex-none min-[360px]:px-3"
              >
                История
              </button>
              <button
                type="button"
                onClick={() => onEditParticipant(p)}
                className="flex-1 rounded-xl bg-white py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 min-[360px]:flex-none min-[360px]:px-3"
              >
                Изменить
              </button>
              <button
                type="button"
                onClick={() => onDeleteParticipant(p.id)}
                className="flex-1 rounded-xl border border-red-200 py-2 text-xs font-medium text-red-700 min-[360px]:flex-none min-[360px]:px-3"
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
