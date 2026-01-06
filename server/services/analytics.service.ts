import { analyticsRepository, type AnalyticsFilters } from '~~/server/repositories'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

interface CategoryBreakdownItem {
  category: string
  type: 'income' | 'expense'
  sum: number
  count: number
}

function transformToFinancialData(
  currentData: CategoryBreakdownItem[],
  lastData: CategoryBreakdownItem[],
  currentMonthName: string,
  lastMonthName: string,
) {
  const transformMonth = (data: CategoryBreakdownItem[], monthName: string) => {
    const income = data.filter(item => item.type === 'income')
    const expenses = data.filter(item => item.type === 'expense')

    const incomeCategories: Record<string, { amount: number, count: number }> = {}
    income.forEach((item) => {
      incomeCategories[item.category] = { amount: item.sum, count: item.count }
    })

    const expenseCategories: Record<string, { amount: number, count: number }> = {}
    expenses.forEach((item) => {
      expenseCategories[item.category] = { amount: item.sum, count: item.count }
    })

    const totalIncome = income.reduce((acc, item) => acc + item.sum, 0)
    const totalExpenses = expenses.reduce((acc, item) => acc + item.sum, 0)

    return {
      month: monthName,
      income: {
        categories: incomeCategories,
        total: totalIncome,
      },
      expenses: {
        categories: expenseCategories,
        total: totalExpenses,
      },
      net: totalIncome - totalExpenses,
    }
  }

  return {
    currentMonth: transformMonth(currentData, currentMonthName),
    lastMonth: transformMonth(lastData, lastMonthName),
  }
}

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

  async generateAIInsights(userId: string) {
    const cachedInsights = await analyticsRepository.getUserInsights(userId)
    if (cachedInsights && dayjs().diff(dayjs(cachedInsights.lastGenerated), 'hour') <= 24) {
      return {
        success: true,
        data: cachedInsights.content,
      }
    }

    const last = dayjs().subtract(1, 'month')
    const current = dayjs()

    const lastMonth = await analyticsRepository.getCategoryBreakdown(userId, {
      startDate: last.startOf('month').format('YYYY-MM-DD'),
      endDate: last.endOf('month').format('YYYY-MM-DD'),
    })

    const currentMonth = await analyticsRepository.getCategoryBreakdown(userId, {
      startDate: current.startOf('month').format('YYYY-MM-DD'),
      endDate: current.endOf('month').format('YYYY-MM-DD'),
    })

    const financialData = transformToFinancialData(currentMonth, lastMonth, current.format('MMMM'), last.format('MMMM'))

    const res = await openai.responses.parse({
      model: 'gpt-4o',
      instructions: 'Use Indonesian language',
      input: `You are a financial insights assistant for Jolt AI, an expense and income tracking app. Your role is to analyze a user's financial data and provide helpful, concise insights about their spending and income patterns.

    Analyze the following financial data and generate 3-5 brief insights that highlight the most meaningful patterns, changes, or observations. Focus on:
    - Significant changes in spending categories between months
    - Income trends and stability
    - Overall financial health (net position)
    - Notable shifts in transaction frequency or amounts
    - Spending distribution across categories

    Guidelines:
    - Keep each insight to 1-2 sentences maximum
    - Be conversational and helpful, not judgmental
    - Focus on the most actionable or interesting patterns
    - Use specific numbers and percentages when relevant
    - Prioritize insights about significant changes (>20%) over minor fluctuations
    - If there's positive progress (savings increasing, expenses decreasing), acknowledge it
    - Avoid generic statements; be specific to this user's data

    Financial Data:
    ${JSON.stringify(financialData)}

    Return your response as a JSON array of insight strings, like this:
    ["insight 1", "insight 2", "insight 3"]`,
      text: {
        format: zodTextFormat(z.object({ insights: z.array(z.string()) }), 'insights'),
      },
    })

    const insights = res.output_parsed?.insights ?? []

    analyticsRepository.createUserInsights(userId, {
      content: insights,
      monthYear: current.format('MMMM YYYY'),
      lastGenerated: new Date(),
    })

    return {
      success: true,
      data: insights,
    }
  },
}
