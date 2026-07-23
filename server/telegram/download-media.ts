export type TelegramFileApi = {
  getFile: (fileId: string) => Promise<{ file_path?: string }>
}

export async function downloadTelegramFile(
  fileId: string,
  botToken: string,
  api: TelegramFileApi,
): Promise<Uint8Array> {
  const file = await api.getFile(fileId)
  if (!file.file_path) {
    throw new Error('telegram-file-path-missing')
  }

  const url = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('telegram-file-download-failed')
  }

  return new Uint8Array(await response.arrayBuffer())
}
