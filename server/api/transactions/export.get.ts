import z from 'zod'
import { exportService } from '~~/server/services'
import dayjs from 'dayjs'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    type: z.enum(['expense', 'income']).nullable().optional(),
    categories: z.string().nullable().optional(),
    includeSummary: z.string().optional().transform(val => val === 'true'),
  }).parse)

  const buffer = await exportService.exportToExcel(userId, query)

  const date = dayjs().format('YYYY-MM-DD')
  const filename = `jolt-transactions-${date}.xlsx`

  setHeaders(event, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${filename}"`,
  })

  return buffer
})
