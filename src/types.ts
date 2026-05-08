export type PaymentStatus = 'not_started' | 'partial' | 'full'

export interface Participant {
  id: string
  lastName: string
  firstName?: string
  totalDue: number
}

export interface Payment {
  id: string
  participantId: string
  /** Хранение в формате ГГГГ-ММ-ДД */
  date: string
  amount: number
  comment?: string
}

export interface AppSettings {
  currency: string
  /** Сумма по умолчанию для новых участников */
  defaultAmount: number
}

export interface AppData {
  participants: Participant[]
  payments: Payment[]
  settings: AppSettings
}

export interface ParticipantComputed extends Participant {
  paid: number
  remainder: number
  status: PaymentStatus
  /** ДД.ММ.ГГГГ или null */
  fullPaymentDate: string | null
}
