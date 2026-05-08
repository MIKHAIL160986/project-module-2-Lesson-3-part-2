import type { AppData } from '../types'
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../constants'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const p = JSON.parse(raw) as AppData
    if (!p.participants || !p.payments || !p.settings) return emptyData()
    return {
      participants: p.participants,
      payments: p.payments,
      settings: {
        currency: String(p.settings.currency ?? DEFAULT_SETTINGS.currency),
        defaultAmount: Number(p.settings.defaultAmount) || 0,
      },
    }
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function emptyData(): AppData {
  return {
    participants: [],
    payments: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}
