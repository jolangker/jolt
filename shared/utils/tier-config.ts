// Tier configuration for FREE and PRO subscription tiers
export type Tier = 'FREE' | 'PRO'

export const TIER_CONFIG = {
  FREE: {
    dataHistoryDays: 7,
    canExport: false,
    canUseAIInsights: false,
    canCreateCustomCategory: false,
    maxVoicePerDay: 3,
  },
  PRO: {
    dataHistoryDays: Infinity,
    canExport: true,
    canUseAIInsights: true,
    canCreateCustomCategory: true,
    maxVoicePerDay: Infinity,
  },
} as const

export type TierConfig = typeof TIER_CONFIG

export function getTierConfig(tier: Tier) {
  return TIER_CONFIG[tier]
}

export function canAccessFeature(tier: Tier, feature: keyof TierConfig['FREE']): boolean {
  const config = getTierConfig(tier)
  const value = config[feature]
  return typeof value === 'boolean' ? value : true
}
