import { WsMessage } from './sw'

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

const getSiteName = () => document.location.hostname

const parseSelector = (_selector: string) => {
  let selector = _selector
  let index = 0
  if (_selector.startsWith('(')) {
    selector = _selector.substring(1, _selector.indexOf(')'))
    index = parseInt(_selector.substring(_selector.indexOf(')') + 2), _selector.length - 1)
  }
  return { selector, index }
}

type InfoType = 'state' | 'title' | 'artist' | 'album' | 'cover' | 'duration' | 'position' | 'volume' | 'rating' | 'repeat' | 'shuffle'
// Selector is either a normal selector, or: '(selector)[index]' for querySelectorAll
const _querySelector = <T, E extends Element>(selectorStr: string, exec: (el: E) => T | null, defaultValue: T, type?: InfoType): T => {
  const { selector, index } = parseSelector(selectorStr)
  const el = document.querySelectorAll<E>(selector)[index]
  if (!el) {
    if (type) {
      sendWsMessage({
        event: 'sendAutomaticReport',
        report: {
          message: `[${getSiteName()}] _querySelector could not find element for ${type}`
        }
      })
    }
    return defaultValue
  }
  const result = exec(el)
  // Exclude 0 as volume can be 0
  // Empty strings however are not valid
  if (!result && result !== 0) {
    if (type) {
      sendWsMessage({
        event: 'sendAutomaticReport',
        report: {
          message: `[${getSiteName()}] _querySelector could not get result from exec for ${type}`
        }
      })
    }
    return defaultValue
  }

  return result
}
export const querySelector = <T, E extends Element>(selector: string, exec: (el: E) => T | null, defaultValue: T): T => _querySelector(selector, exec, defaultValue)
export const querySelectorReport = <T, E extends Element>(selector: string, exec: (el: E) => T | null, defaultValue: T, type: InfoType): T => _querySelector(selector, exec, defaultValue, type)

type EventType = 'togglePlaying' | 'next' | 'previous' | 'setPositionSeconds' | 'setPositionPercentage' | 'setVolume' | 'toggleRepeat' | 'toggleShuffle' | 'toggleThumbsUp' | 'toggleThumbsDown' | 'setRating'
export const _querySelectorEvent = <E extends Element>(selectorOrGetter: string | (() => E), action: (el: E) => any, type?: EventType): boolean => {
  let el
  if (typeof selectorOrGetter === 'string') {
    const { selector, index } = parseSelector(selectorOrGetter)
    el = document.querySelectorAll<E>(selector)[index]
  } else {
    el = selectorOrGetter()
  }
  if (!el) {
    if (type) {
      sendWsMessage({
        event: 'sendAutomaticReport',
        report: {
          message: `[${getSiteName()}] _querySelectorEvent could not find element for ${type}`
        }
      })
    }
    return false
  }
  action(el)
  return true
}
export const querySelectorEvent = <E extends Element>(selectorOrGetter: string | (() => E), action: (el: E) => any) => _querySelectorEvent(selectorOrGetter, action)
export const querySelectorEventReport = <E extends Element>(selectorOrGetter: string | (() => E), action: (el: E) => any, type: EventType) => _querySelectorEvent(selectorOrGetter, action, type)

export const isVersionOutdated = (currentVersion: string, latestVersion: string) => {
  // The version is major.minor.patch, compare version against what the extension knows is the latest version
  // C# actually gives us a version with 4 numbers, but this just ignores the last one
  const [major, minor, patch] = latestVersion.split('.').map((v) => parseInt(v))
  const [major2, minor2, patch2] = currentVersion.split('.').map((v) => parseInt(v))
  if (major2 < major || (major2 === major && minor2 < minor) || (major2 === major && minor2 === minor && patch2 < patch))
    return true
  else
    return false
}

export type CustomAdapter = {
  port: number
  enabled: boolean
}

export type TSupportedSites = 'Apple Music' | 'Bandcamp' | 'Deezer' | 'Pandora' | 'Plex' | 'Soundcloud' | 'Spotify' | 'Tidal' | 'Twitch' | 'Youtube' | 'Youtube Embeds' | 'Youtube Music'
export const SupportedSites: TSupportedSites[] = ['Apple Music', 'Bandcamp', 'Deezer', 'Pandora', 'Plex', 'Soundcloud', 'Spotify', 'Tidal', 'Twitch', 'Youtube', 'Youtube Embeds', 'Youtube Music']

export const defaultUpdateFrequencyMs = 250

export type Settings = {
  updateFrequencyMs: {
    [port: number]: number
  }
  useGeneric: boolean
  useGenericList: boolean
  isListBlocked: boolean
  genericList: string[]
  customAdapters: CustomAdapter[]
  disabledBuiltInAdapters: string[]
  disabledSites: TSupportedSites[]
  useTelemetry: boolean
}

export const defaultSettings: Settings = {
  updateFrequencyMs: {},
  useGeneric: false,
  useGenericList: false,
  isListBlocked: false,
  genericList: ['streamable.com', 'www.adultswim.com'],
  customAdapters: [],
  disabledBuiltInAdapters: [],
  disabledSites: [],
  useTelemetry: false
}

export type Adapter = {
  name: string,
  port: number,
  gh: string
}

export const BuiltInAdapters: Adapter[] = [
  {
    name: 'Rainmeter Adapter',
    port: 8974,
    gh: 'keifufu/WebNowPlaying-Redux-Rainmeter'
  }
]

// this is per site, so it won't spam the report to the sw over and over
const reportCache: Record<string, string> = {}

export const sendWsMessage = (message: WsMessage): Promise<any> => new Promise((resolve) => {
  if (!window?.chrome?.runtime?.id) {
    if (message.event === 'getSettings') resolve(defaultSettings)
    return
  }
  if (message.event === 'sendAutomaticReport' && message.report) {
    if (reportCache[message.report.message]) return
    reportCache[message.report.message] = message.report.message
  }
  chrome.runtime.sendMessage(message, (response) => {
    resolve(response)
  })
})

export const getVersionFromGithub = async (gh: string) => {
  try {
    const releaseApiLink = `https://api.github.com/repos/${gh}/releases?per_page=1`
    const response = await fetch(releaseApiLink)
    if (response.ok) {
      const json = await response.json()
      let tag = json[0].tag_name
      if (!tag) return 'Error'
      if (tag.startsWith('v')) tag = tag.slice(1)
      return tag
    }
    return 'Error'
  } catch {
    return 'Error'
  }
}

export const getExtensionVersion = () => {
  if (typeof window.chrome?.runtime?.getManifest === 'function') return chrome.runtime.getManifest().version
  else return '0.0.0'
}