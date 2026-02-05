import { transactionRepository, categoryRepository, type TransactionFilters } from '~~/server/repositories'
import ExcelJS from 'exceljs'
import dayjs from 'dayjs'

export const exportService = {
  async exportToExcel(userId: string, tier: 'FREE' | 'PRO', filters: TransactionFilters & { includeSummary?: boolean }) {
    if (tier === 'FREE') {
      throw createError({
        statusCode: 402,
        statusMessage: 'Export hanya tersedia untuk pengguna PRO. Upgrade untuk membuka fitur ini.',
      })
    }

    const transactions = await transactionRepository.findMany(userId, filters)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Wuzz'
    workbook.created = new Date()

    // Sheet 1: Transactions
    const sheet = workbook.addWorksheet('Transactions')

    sheet.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Tipe', key: 'type', width: 10 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Jumlah', key: 'amount', width: 15 },
      { header: 'Catatan', key: 'note', width: 40 },
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
        { header: 'Metrik', key: 'metric', width: 25 },
        { header: 'Nilai', key: 'value', width: 20 },
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
        { metric: 'Total Transaksi', value: transactions.length },
        { metric: 'Total Pemasukan', value: totalIncome },
        { metric: 'Total Pengeluaran', value: totalExpense },
        { metric: 'Saldo Net', value: netBalance },
        { metric: 'Range Tanggal', value: `${filters.startDate || 'Semua Waktu'} to ${filters.endDate || 'Now'}` },
      ])

      summarySheet.getColumn('value').numFmt = '#,##0'
    }

    return await workbook.xlsx.writeBuffer()
  },

  async importTransactions(userId: string, buffer: Buffer) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const sheet = workbook.getWorksheet('Transactions')
    if (!sheet) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format file tidak valid: Sheet "Transactions" tidak ditemukan',
      })
    }

    // Get existing categories to map names to IDs
    const existingCategories = await categoryRepository.findAll(userId)
    const categoryMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c.id]))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transactionsToInsert: any[] = []
    let newCategoriesCount = 0

    // Iterate rows (skip header)
    // sheet.eachRow starts from 1, header is 1, so data starts from 2
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Skip header

      const date = row.getCell(1).value
      const type = row.getCell(2).value?.toString().toLowerCase()
      const categoryName = row.getCell(3).value?.toString()
      const amount = row.getCell(4).value
      const note = row.getCell(5).value?.toString() || ''

      if (date && type && categoryName && amount) {
        rows.push({ date, type, categoryName, amount, note })
      }
    })

    for (const row of rows) {
      let categoryId = categoryMap.get(row.categoryName.toLowerCase())

      // If category doesn't exist, create it
      if (!categoryId) {
        if (row.type !== 'income' && row.type !== 'expense') {
          // Default to expense if invalid type, or skip?
          // For safety assume expense if ambiguous, but here strictly check
          continue
        }

        const [newCategory] = await categoryRepository.create({
          userId,
          name: row.categoryName,
          description: 'Imported from Excel',
          type: row.type as 'income' | 'expense',
          isDefault: false,
          icon: 'i-heroicons-tag', // Default icon
        })

        categoryId = newCategory.id
        categoryMap.set(row.categoryName.toLowerCase(), categoryId)
        newCategoriesCount++
      }

      transactionsToInsert.push({
        categoryId,
        type: row.type,
        note: row.note,
        amount: row.amount.toString(),
        date: row.date,
      })
    }

    if (transactionsToInsert.length > 0) {
      await transactionRepository.createMany(userId, transactionsToInsert)
    }

    return {
      imported: transactionsToInsert.length,
      createdCategories: newCategoriesCount,
    }
  },
}
