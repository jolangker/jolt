import solar from '@iconify-json/solar/icons.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconsData = solar as any

export default defineEventHandler(() => {
  const icons = Object.keys(iconsData.icons)
    .filter(name => name.includes('outline'))
    .map(name => `i-solar:${name}`)
  return {
    data: icons,
  }
})
