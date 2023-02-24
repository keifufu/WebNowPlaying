export const getMediaSessionCover = () => {
  // Find biggest album art
  if (!navigator.mediaSession.metadata?.artwork)
    return ''
  const [biggestImage] = Array.from(navigator.mediaSession.metadata.artwork).sort((a, b) => {
    const aSize = parseInt(a.sizes?.split('x')[1] || '0')
    const bSize = parseInt(b.sizes?.split('x')[1] || '0')

    return bSize - aSize
  })

  // Never remove the search from the url again
  return biggestImage.src
}

// Converts every word in a string to start with a capital letter
export const capitalize = (str: string) => str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())

// Convert seconds to a time string acceptable to Rainmeter
const pad = (num: number, size: number) => num.toString().padStart(size, '0')
export const timeInSecondsToString = (timeInSeconds: number) => {
  const timeInMinutes = Math.floor(timeInSeconds / 60)
  if (timeInMinutes < 60)
    return timeInMinutes + ':' + pad(Math.floor(timeInSeconds % 60), 2)

  return Math.floor(timeInMinutes / 60) + ':' + pad(Math.floor(timeInMinutes % 60), 2) + ':' + pad(Math.floor(timeInSeconds % 60), 2)
}

export type Settings = {
  swPort: number
  updateFrequencyMs: number
  useGeneric: boolean
  useGenericList: boolean
  isListBlocked: boolean
  genericList: string[]
}

export const defaultSettings: Settings = {
  swPort: 8974,
  updateFrequencyMs: 50,
  useGeneric: false,
  useGenericList: false,
  isListBlocked: false,
  genericList: ['streamable.com', 'www.adultswim.com']
}

// Even though MDN says chrome.storage.sync is not supported in Opera,
// it seems at worst it will just use chrome.storage.local instead.
export function getSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      swPort: defaultSettings.swPort,
      updateFrequencyMs: defaultSettings.updateFrequencyMs,
      useGeneric: defaultSettings.useGeneric,
      useGenericList: defaultSettings.useGenericList,
      isListBlocked: defaultSettings.isListBlocked,
      genericList: defaultSettings.genericList
    }, (items: Settings) => {
      resolve(items)
    })
  })
}

// There are however limits to how often we can write to storage
// 120/m 1800/h
export function setSettings(settings: Settings) {
  chrome.storage.sync.set(settings)
}