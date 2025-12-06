import { transactionRepository, type TransactionFilters } from '~~/server/repositories'
import ExcelJS from 'exceljs'
import dayjs from 'dayjs'

export const exportService = {
  async exportToExcel(userId: string, filters: TransactionFilters & { includeSummary?: boolean }) {
    const transactions = await transactionRepository.findMany(userId, filters)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Jolt'
    workbook.created = new Date()

    // Sheet 1: Transactions
    const sheet = workbook.addWorksheet('Transactions')

    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Note', key: 'note', width: 40 },
    ]

    // Style header
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    transactions.forEach((trx) => {
      sheet.addRow({
        date: dayjs(trx.date).format('YYYY-MM-DD'),
        type: trx.type,
        category: trx.category.name,
        amount: parseFloat(trx.amount),
        note: trx.note,
      })
    })

    // Format amount column as number
    sheet.getColumn('amount').numFmt = '#,##0'

    // Sheet 2: Summary (Optional)
    if (filters.includeSummary) {
      const summarySheet = workbook.addWorksheet('Summary')
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 },
      ]

      summarySheet.getRow(1).font = { bold: true }
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

      const netBalance = totalIncome - totalExpense

      summarySheet.addRows([
        { metric: 'Total Transactions', value: transactions.length },
        { metric: 'Total Income', value: totalIncome },
        { metric: 'Total Expenses', value: totalExpense },
        { metric: 'Net Balance', value: netBalance },
        { metric: 'Date Range', value: `${filters.startDate || 'All time'} to ${filters.endDate || 'Now'}` },
      ])

      summarySheet.getColumn('value').numFmt = '#,##0'
    }

    return await workbook.xlsx.writeBuffer()
  },
}
