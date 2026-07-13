import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { categoryRepository } from '~~/server/repositories'

export function createGetUserInfoTool(userId: string): Tool {
  return tool({
    description: 'Get the current user info and default categories. Use this to check the user context or when you need to know what categories are available by default.',
    inputSchema: z.object({}),
    execute: async () => {
      return executeGetUserInfo(userId, categoryRepository.findAll)
    },
  })
}

export async function executeGetUserInfo(
  userId: string,
  findAllFn: typeof categoryRepository.findAll,
) {
  const allCategories = await findAllFn(userId)
  const defaultCategories = allCategories.filter(c => c.isDefault)

  return {
    userId,
    defaultCategories: defaultCategories.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      description: c.description,
    })),
  }
}
