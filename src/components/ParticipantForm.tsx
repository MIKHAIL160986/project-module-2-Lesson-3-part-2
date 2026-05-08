import { FormEvent, useState } from 'react'

interface ParticipantFormProps {
  defaultAmount: number
  onDefaultAmountChange: (value: number) => void
  onSubmitParticipant: (data: {
    lastName: string
    firstName?: string
    totalDue: number
  }) => void
}

export function ParticipantForm({
  defaultAmount,
  onDefaultAmountChange,
  onSubmitParticipant,
}: ParticipantFormProps) {
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [amount, setAmount] = useState(String(defaultAmount || ''))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const ln = lastName.trim()
    if (!ln) return
    const raw = String(amount).replace(/\s/g, '').replace(',', '.').trim()
    const parsed = Number(raw)
    const totalDue =
      raw === '' ? defaultAmount : Number.isFinite(parsed) ? parsed : defaultAmount
    onSubmitParticipant({
      lastName: ln,
      firstName: firstName.trim() || undefined,
      totalDue,
    })
    setLastName('')
    setFirstName('')
    setAmount(String(defaultAmount || ''))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-base font-semibold text-slate-900">Добавить участника</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Фамилия *</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="Иванов"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Имя / отчество
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="Необязательно"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Сумма к оплате
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Сумма по умолчанию для всех
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={defaultAmount || ''}
            onChange={(e) => onDefaultAmountChange(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Добавить
        </button>
      </div>
    </form>
  )
}
