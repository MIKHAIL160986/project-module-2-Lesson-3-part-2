import { useCallback, useEffect, useState } from 'react'
import type { AppData, Participant, Payment } from '../types'
import { loadData, saveData } from '../utils/storage'
import { createId } from '../utils/id'

export function useAppState() {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  const setSettings = useCallback((patch: Partial<AppData['settings']>) => {
    setData((d) => ({
      ...d,
      settings: { ...d.settings, ...patch },
    }))
  }, [])

  const importFull = useCallback((next: AppData) => {
    setData(next)
  }, [])

  const addParticipant = useCallback((p: Omit<Participant, 'id'>) => {
    setData((d) => ({
      ...d,
      participants: [...d.participants, { ...p, id: createId() }],
    }))
  }, [])

  const updateParticipant = useCallback((id: string, patch: Partial<Participant>) => {
    setData((d) => ({
      ...d,
      participants: d.participants.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }))
  }, [])

  const deleteParticipant = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      participants: d.participants.filter((x) => x.id !== id),
      payments: d.payments.filter((p) => p.participantId !== id),
    }))
  }, [])

  const addPayment = useCallback((pay: Omit<Payment, 'id'>) => {
    setData((d) => ({
      ...d,
      payments: [...d.payments, { ...pay, id: createId() }],
    }))
  }, [])

  const updatePayment = useCallback((id: string, patch: Partial<Payment>) => {
    setData((d) => ({
      ...d,
      payments: d.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }, [])

  const deletePayment = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      payments: d.payments.filter((p) => p.id !== id),
    }))
  }, [])

  return {
    data,
    setSettings,
    importFull,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addPayment,
    updatePayment,
    deletePayment,
  }
}
