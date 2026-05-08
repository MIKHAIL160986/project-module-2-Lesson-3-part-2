import { FormEvent, useEffect, useState } from 'react'
import type { Participant } from '../types'

interface EditParticipantModalProps {
  open: boolean
  participant: Participant | null
  onClose: () => void
  onSave: (id: string, data: Omit<Participant, 'id'>) => void
}

export function EditParticipantModal({
  open,
  participant,
  onClose,
  onSave,
}: EditParticipantModalProps) {
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [totalDue, setTotalDue] = useState('')

  useEffect(() => {
    if (participant) {
      setLastName(participant.lastName)
      setFirstName(participant.firstName ?? '')
      setTotalDue(String(participant.totalDue))
    }
  }, [participant])

  if (!open || !participant) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const ln = lastName.trim()
    if (!ln) return
    const td = Number(String(totalDue).replace(/\s/g, '').replace(',', '.')) || 0
    onSave(participant.id, {
      lastName: ln,
      firstName: firstName.trim() || undefined,
      totalDue: td,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Участник</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Фамилия *</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Имя / отчество
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Сумма к оплате
            </label>
            <input
              value={totalDue}
              onChange={(e) => setTotalDue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm tabular-nums"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
