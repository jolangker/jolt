export function formatCurrency(value: unknown) {
  let handledValue
  if (typeof value === 'number') handledValue = value
  else if (typeof value === 'string') handledValue = parseFloat(value)
  else handledValue = 0
  return Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(handledValue)
}
