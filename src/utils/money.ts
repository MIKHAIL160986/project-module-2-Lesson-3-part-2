export function formatMoney(amount: number, currency: string): string {
  const n = Number.isFinite(amount) ? amount : 0
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
  return `${formatted}\u00A0${currency}`.trim()
}

export function parseMoneyInput(value: string): number {
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}
