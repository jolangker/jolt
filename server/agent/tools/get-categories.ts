import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { categoryService } from '~~/server/services'

export function createGetCategoriesTool(userId: string): Tool {
  return tool({
    description: 'Get all available categories (default + custom). Use this before adding a transaction to find the right categoryId, or when the user asks to see their categories.',
    inputSchema: z.object({}),
    execute: async () => {
      return executeGetCategories(userId, categoryService.getAll)
    },
  })
}

export async function executeGetCategories(
  userId: string,
  getAllFn: typeof categoryService.getAll,
) {
  const result = await getAllFn(userId)
  return {
    categories: result.data.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      description: c.description,
      icon: c.icon,
      isDefault: c.isDefault,
    })),
  }
}
