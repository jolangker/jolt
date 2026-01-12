import { userRepository } from '../repositories'

export default defineEventHandler(async (event) => {
  const auth = event.context.auth

  const user = await userRepository.findById(auth.userId)

  return {
    success: true,
    data: {
      ...user,
      isNewUser: auth.isNewUser,
    },
  }
})
