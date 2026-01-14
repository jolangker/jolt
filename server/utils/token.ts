export function generateShortToken(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    out += chars[array[i] % chars.length]
  }
  return out
}

export function generateOtpCode(length = 6) {
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += (array[i] % 10).toString()
  }
  return out
}
