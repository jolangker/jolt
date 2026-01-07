import { categoryRepository } from '~~/server/repositories'
import type { categories } from '~~/server/db/schema'

export const categoryService = {
  async getAll(userId: string) {
    const data = await categoryRepository.findAll(userId)

    return {
      success: true,
      data,
    }
  },

  async create(userId: string, tier: 'FREE' | 'PRO', data: typeof categories.$inferInsert) {
    if (tier === 'FREE') {
      throw createError({
        statusCode: 402,
        statusMessage: 'Kategori kustom hanya tersedia untuk pengguna PRO. Upgrade untuk membuat kategori sendiri.',
      })
    }

    const allCategories = await categoryRepository.findAll(userId)
    const customCategories = allCategories.filter(c => c.userId === userId)

    if (customCategories.length >= 50) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum limit of 50 custom categories reached',
      })
    }

    // Check for duplicate name (case insensitive)
    const nameExists = allCategories.some(c => c.name.toLowerCase() === data.name.toLowerCase())
    if (nameExists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Category with this name already exists',
      })
    }

    const [category] = await categoryRepository.create({
      ...data,
      userId,
      isDefault: false,
    })

    return { success: true, data: category }
  },

  async update(userId: string, id: number, data: Partial<typeof categories.$inferInsert>) {
    const category = await categoryRepository.findById(id)

    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    if (category.userId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot edit this category' })
    }

    // check name uniqueness if name is being updated
    if (data.name) {
      const allCategories = await categoryRepository.findAll(userId)
      const nameExists = allCategories.some(c => c.id !== id && c.name.toLowerCase() === data.name?.toLowerCase())
      if (nameExists) {
        throw createError({ statusCode: 409, statusMessage: 'Category with this name already exists' })
      }
    }

    const [updated] = await categoryRepository.update(id, userId, data)
    return { success: true, data: updated }
  },

  async delete(userId: string, id: number) {
    const category = await categoryRepository.findById(id)

    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    if (category.userId !== userId) {
      throw createError({ statusCode: 403, statusMessage: 'Cannot delete this category' })
    }

    await categoryRepository.delete(id, userId)
    return { success: true }
  },
}
