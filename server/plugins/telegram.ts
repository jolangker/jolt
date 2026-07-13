import { initializeBot } from '~~/server/telegram/adapter'

export default defineNitroPlugin(async () => {
  await initializeBot()
})
