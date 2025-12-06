import { categoryRepository } from '~~/server/repositories'

export const categoryService = {
  async getAll() {
    const data = await categoryRepository.findAll()

    return {
      success: true,
      data,
    }
  },
}
