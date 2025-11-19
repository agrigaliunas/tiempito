export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isToday(dateString: string): boolean {
  return dateString === formatDate(new Date())
}

export function getDateKey(date: Date = new Date()): string {
  return formatDate(date)
}
