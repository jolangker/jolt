export const DEFAULT_APP_TIMEZONE = 'Asia/Jakarta'

export function resolveAppTimeZone(env: NodeJS.ProcessEnv = process.env): string {
  const timeZone = env.APP_TIMEZONE?.trim() || DEFAULT_APP_TIMEZONE

  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format()
  }
  catch {
    throw new Error(`APP_TIMEZONE must be a valid IANA timezone. Received: ${timeZone}`)
  }

  return timeZone
}

export function formatAgentDateContext(referenceTime: Date, timeZone: string): { date: string, weekday: string } {
  if (Number.isNaN(referenceTime.getTime())) {
    throw new Error('Agent reference time must be a valid Date')
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  }).formatToParts(referenceTime)

  const getPart = (type: Intl.DateTimeFormatPartTypes): string => {
    const value = parts.find(part => part.type === type)?.value
    if (!value) throw new Error(`Unable to format Agent date part: ${type}`)
    return value
  }

  return {
    date: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
    weekday: getPart('weekday'),
  }
}
