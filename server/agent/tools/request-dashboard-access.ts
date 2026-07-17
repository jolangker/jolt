import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { dashboardAccessLinkService } from '~~/server/services'

export function createRequestDashboardAccessTool(userId: string, deliver?: (link: { url: string, expiresAt: Date }) => void): Tool {
  return tool({
    description: 'Request a dashboard access link only when the user clearly asks to open or access their Jolt dashboard.',
    inputSchema: z.object({}),
    execute: async () => {
      const link = await dashboardAccessLinkService.issue(userId)
      deliver?.(link)
      return { delivery: 'telegram_private_message', expiresAt: link.expiresAt.toISOString() }
    },
  })
}

export async function executeRequestDashboardAccess(
  userId: string,
  issue: (userId: string) => Promise<{ url: string, expiresAt: Date }>,
) {
  const link = await issue(userId)
  return { delivery: 'telegram_private_message', expiresAt: link.expiresAt.toISOString() }
}
