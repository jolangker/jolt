import { exportService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const files = await readMultipartFormData(event)
  if (!files || files.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File excel tidak ditemukan',
    })
  }

  const file = files[0]
  if (!file.filename?.endsWith('.xlsx')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Format file harus .xlsx',
    })
  }

  try {
    const result = await exportService.importTransactions(userId, file.data)
    return {
      statusCode: 200,
      message: 'Transaksi berhasil diimport',
      data: result,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal mengimport transaksi',
    })
  }
})
