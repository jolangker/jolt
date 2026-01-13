import { paymentService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  // Ensure user is authenticated
  const session = await requireUserSession(event)
  const userId = session.user.id
  const userPhone = session.user.phoneNumber

  try {
    const result = await paymentService.createTransaction(userId, userPhone)

    return {
      success: true,
      data: result,
    }
  }
  catch (error: any) {
    console.error('[Payment] Create transaction error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create payment transaction',
    })
  }
})
