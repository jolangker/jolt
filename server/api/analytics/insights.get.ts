import { analyticsService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const tier = event.context.auth.tier

  return analyticsService.generateAIInsights(userId, tier)
})
