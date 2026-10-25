export const money = (n: number, digits = 2) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits })

export const round = (n: number, d = 0) => {
  const f = 10 ** d
  return Math.round(n * f) / f
}

export function weekOf(date = new Date()): Date {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const todayIndex = () => (new Date().getDay() + 6) % 7

export const isoDate = (d: Date) => d.toISOString().slice(0, 10)
