import { describe, expect, it } from 'bun:test'
import { generateTransaction } from '../server/db/script'

describe('transaction seeder', () => {
  it('falls back to an available category type', () => {
    const categories = [
      { id: 1, name: 'Food', type: 'expense' as const },
    ]

    expect(generateTransaction(categories, 'income').type).toBe('expense')
  })
})
