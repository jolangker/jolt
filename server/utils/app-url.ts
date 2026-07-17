export function resolveAppBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const value = env.APP_BASE_URL || env.NUXT_PUBLIC_APP_URL

  if (!value) {
    throw new Error('APP_BASE_URL or NUXT_PUBLIC_APP_URL must be configured to issue dashboard access links')
  }

  return value.replace(/\/$/, '')
}
