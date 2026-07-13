import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { categoryService } from '~~/server/services'

export function createCreateCategoryTool(userId: string): Tool {
  return tool({
    description: 'Create a new custom category. Use this when the user wants to add a category that does not exist yet, e.g. "create a Pets category".',
    inputSchema: z.object({
      name: z.string().min(1).describe('The category name, e.g. "Pets", "Gym", "Gifts"'),
      description: z.string().min(1).describe('A short description of what this category covers'),
      type: z.enum(['expense', 'income']).describe('Whether this category is for expenses or income'),
      icon: z.string().optional().describe('An optional icon identifier'),
    }),
    execute: async (args) => {
      return executeCreateCategory(userId, args, categoryService.create)
    },
  })
}

export async function executeCreateCategory(
  userId: string,
  args: { name: string, description: string, type: 'expense' | 'income', icon?: string },
  createFn: typeof categoryService.create,
) {
  const result = await createFn(userId, {
    name: args.name,
    description: args.description,
    type: args.type,
    icon: args.icon ?? null,
  })
  const cat = result.data!
  return {
    id: cat.id,
    name: cat.name,
    type: cat.type,
    description: cat.description,
    icon: cat.icon,
  }
}
