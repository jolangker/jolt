// Composable for accessing current user authentication and tier info
export function useAuth() {
  const { loggedIn, user, session, clear } = useUserSession()

  const tier = computed(() => user.value?.tier ?? 'FREE')
  const isPro = computed(() => tier.value === 'PRO')
  const isFree = computed(() => tier.value === 'FREE')

  // Check if user has trial available
  const canStartTrial = computed(() => !user.value?.isTrialUsed)

  // Check if subscription is active (PRO and not expired)
  const isSubscriptionActive = computed(() => {
    if (tier.value !== 'PRO') return false
    if (!user.value?.subscriptionEndsAt) return true
    return new Date(user.value.subscriptionEndsAt) > new Date()
  })

  return {
    user,
    loggedIn,
    session,
    tier,
    isPro,
    isFree,
    canStartTrial,
    isSubscriptionActive,
    logout: clear,
  }
}
