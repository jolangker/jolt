export function formatCurrency(value: unknown, short = false) {
  let handledValue
  if (typeof value === 'number') handledValue = value
  else if (typeof value === 'string') handledValue = parseFloat(value)
  else handledValue = 0
  return Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: short ? 'compact' : 'standard',
    compactDisplay: short ? 'short' : 'long',
    maximumFractionDigits: 0,
  }).format(handledValue)
}
