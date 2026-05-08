import type { Participant, Payment, ParticipantComputed, PaymentStatus } from '../types'
import { compareIso, formatRuDate } from './dates'

export function sumPaymentsForParticipant(
  participantId: string,
  payments: Payment[],
  excludePaymentId?: string
): number {
  return payments
    .filter((p) => p.participantId === participantId && p.id !== excludePaymentId)
    .reduce((s, p) => s + p.amount, 0)
}

export function getStatus(paid: number, totalDue: number): PaymentStatus {
  if (totalDue <= 0) return 'full'
  if (paid >= totalDue) return 'full'
  if (paid > 0) return 'partial'
  return 'not_started'
}

export function computeFullPaymentDate(
  participant: Participant,
  payments: Payment[],
  excludePaymentId?: string
): string | null {
  if (participant.totalDue <= 0) {
    return null
  }
  const mine = payments.filter(
    (p) => p.participantId === participant.id && p.id !== excludePaymentId
  )
  const sorted = [...mine].sort((a, b) => {
    const c = compareIso(a.date, b.date)
    if (c !== 0) return c
    return a.id.localeCompare(b.id)
  })
  let sum = 0
  for (const pay of sorted) {
    sum += pay.amount
    if (sum >= participant.totalDue) {
      return formatRuDate(pay.date)
    }
  }
  return null
}

export function computeParticipant(
  participant: Participant,
  payments: Payment[]
): ParticipantComputed {
  const paid = sumPaymentsForParticipant(participant.id, payments)
  const remainder = Math.max(0, participant.totalDue - paid)
  const status = getStatus(paid, participant.totalDue)
  const fullPaymentDate =
    status === 'full' ? computeFullPaymentDate(participant, payments) : null
  return {
    ...participant,
    paid,
    remainder,
    status,
    fullPaymentDate,
  }
}

export function computeAllParticipants(
  participants: Participant[],
  payments: Payment[]
): ParticipantComputed[] {
  return participants.map((p) => computeParticipant(p, payments))
}

export function statusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'not_started':
      return 'Не начал'
    case 'partial':
      return 'Частично оплатил'
    case 'full':
      return 'Полностью оплатил'
  }
}
