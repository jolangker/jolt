import { analyticsService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId

  return analyticsService.generateAIInsights(userId)
})
