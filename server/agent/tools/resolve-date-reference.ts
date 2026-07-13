import dayjs from 'dayjs'

export function resolveDateReference(reference: string): { startDate?: string, endDate?: string } {
  if (reference === 'yesterday') {
    const date = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    return { startDate: date, endDate: date }
  }

  if (reference === 'today') {
    const date = dayjs().format('YYYY-MM-DD')
    return { startDate: date, endDate: date }
  }

  return {}
}
