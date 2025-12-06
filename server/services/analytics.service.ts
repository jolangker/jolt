import { analyticsRepository, type AnalyticsFilters } from '~~/server/repositories'

export const analyticsService = {
  async getSummary(userId: string, filters: AnalyticsFilters) {
    const { count, sums } = await analyticsRepository.getSummary(userId, filters)

    const income = sums.find(s => s.type === 'income')?.sum || 0
    const expense = sums.find(s => s.type === 'expense')?.sum || 0
    const nett = (Number(income) - Number(expense)).toString()

    return {
      success: true,
      data: {
        count,
        income,
        expense,
        nett,
      },
    }
  },

  async getDailyTrends(userId: string, filters: AnalyticsFilters) {
    const transactions = await analyticsRepository.getDailyTransactions(userId, filters)

    const grouped = transactions.reduce((acc, transaction) => {
      const date = transaction.date.toISOString().split('T')[0]

      if (!acc[date]) {
        acc[date] = { income: '0', expense: '0' }
      }

      if (transaction.type === 'income') {
        acc[date].income = (parseFloat(acc[date].income) + parseFloat(transaction.amount)).toString()
      }
      else {
        acc[date].expense = (parseFloat(acc[date].expense) + parseFloat(transaction.amount)).toString()
      }

      return acc
    }, {} as Record<string, { income: string, expense: string }>)

    return {
      success: true,
      data: Object.entries(grouped).map(([date, { income, expense }]) => ({
        date,
        income,
        expense,
      })),
    }
  },

  async getCategoryBreakdown(userId: string, filters: AnalyticsFilters) {
    const breakdown = await analyticsRepository.getCategoryBreakdown(userId, filters)

    return {
      success: true,
      data: breakdown,
    }
  },
}
