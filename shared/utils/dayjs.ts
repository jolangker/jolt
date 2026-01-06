import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

export function formatDate(date?: string | number | Date) {
  return dayjs(date).format('ddd, DD MMM YYYY')
}

export {
  dayjs,
}
