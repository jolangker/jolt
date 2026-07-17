import { createHash } from 'node:crypto'

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

export function generateAccessCode(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
}

export function digestAccessCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}
