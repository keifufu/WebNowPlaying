import Applemusic from './sites/AppleMusic'
import Bandcamp from './sites/Bandcamp'
import Deezer from './sites/Deezer'
import Generic from './sites/Generic'
import Pandora from './sites/Pandora'
import Plex from './sites/Plex'
import Soundcloud from './sites/Soundcloud'
import Spotify from './sites/Spotify'
import Tidal from './sites/Tidal'
import Twitch from './sites/Twitch'
import Youtube from './sites/Youtube'
import YoutubeEmbed from './sites/YoutubeEmbed'
import YoutubeMusic from './sites/YoutubeMusic'
import { defaultSettings, getSettings, Settings } from './utils'

let settings: Settings = defaultSettings

function getCurrentSite() {
  const host = window.location.hostname

  // prioritize matching youtube.com/embed before youtube.com
  if (host === 'www.youtube.com' && window.location.pathname.startsWith('/embed'))
    return YoutubeEmbed

  if (host === 'music.apple.com')
    return Applemusic
  else if (host.endsWith('bandcamp.com'))
    return Bandcamp
  else if (host === 'www.deezer.com')
    return Deezer
  else if (host === 'www.pandora.com')
    return Pandora
  else if (host === 'app.plex.tv')
    return Plex
  else if (host === 'soundcloud.com')
    return Soundcloud
  else if (host === 'open.spotify.com')
    return Spotify
  else if (host === 'listen.tidal.com')
    return Tidal
  else if (host === 'www.twitch.tv')
    return Twitch
  else if (host === 'www.youtube.com')
    return Youtube
  else if (host === 'music.youtube.com')
    return YoutubeMusic

  if (settings.useGeneric) {
    if (settings.useGenericList) {
      if (settings.isListBlacklist && settings.genericList.includes(host)) return null
      if (!settings.isListBlacklist && !settings.genericList.includes(host)) return null
    }
    Generic.init?.()
    return Generic
  }

  return null
}

// Refer to https://github.com/tjhrulz/WebNowPlaying/blob/master/README.md
// for what these are supposed to return
type SiteInfo = {
  player: () => string
  state: () => number
  title: () => string
  artist: () => string
  album: () => string
  cover: () => string
  duration: () => string
  position: () => string
  volume: (() => number) | null
  rating: (() => number) | null
  repeat: () => number
  shuffle: () => number
}

export type Site = {
  init?: () => void
  ready: () => boolean,
  info: SiteInfo
  events: {
    playpause: (() => void) | null
    next: (() => void) | null
    previous: (() => void) | null
    setPositionSeconds: ((positionInSeconds: number) => void) | null
    setPositionPercentage: ((progressPercentage: number) => void) | null
    setVolume: ((volume: number) => void) | null
    repeat: (() => void) | null
    shuffle: (() => void) | null
    toggleThumbsUp: (() => void) | null
    toggleThumbsDown: (() => void) | null
    rating: ((rating: number) => void) | null
  }
}

const sendEvent = (event: 'outdated' | 'wsConnected' | 'wsDisconnected') => chrome.runtime?.id && chrome.runtime.sendMessage({ event })

let reconnectCount = 0
let wsConnected = false

let outdatedTimeout: NodeJS.Timeout
let updateInterval: NodeJS.Timeout

let _ws: WebSocket
const ws = {
  async init() {
    settings = await getSettings()
    try {
      _ws = new WebSocket(`ws://localhost:${settings.swPort}`)
      _ws.onopen = ws.onOpen
      _ws.onclose = ws.onClose
      _ws.onmessage = ws.onMessage
      _ws.onerror = ws.onError
    } catch {
      sendEvent('wsDisconnected')
    }
  },
  send(data: string) {
    if (_ws.readyState !== WebSocket.OPEN) return
    _ws.send(data)
  },
  onOpen() {
    wsConnected = true
    reconnectCount = 0

    // Seems if the rainmeter plugin is too old, it won't send a version to begin with.
    // This timeout will only run if we haven't received a version within 1 second.
    outdatedTimeout = setTimeout(() => sendEvent('outdated'), 1000)

    updateInterval = setInterval(sendUpdate, settings.updateFrequencyMs)
  },
  onClose() {
    wsConnected = false
    sendEvent('wsDisconnected')

    clearTimeout(outdatedTimeout)
    clearInterval(updateInterval)

    // exponential backoff reconnect with a max of 60 seconds
    setTimeout(() => {
      ws.init()
      reconnectCount += 1
    }, Math.min(1000 * (2 ** reconnectCount), 60000))
  },
  onMessage(event: any) {
    const versionNumber = event.data.toLowerCase().split(':')
    if (versionNumber[0].includes('version')) {
      // Check that version number is the same major version
      if (versionNumber[1].split('.')[1] < 5) {
        sendEvent('outdated')
      } else {
        clearTimeout(outdatedTimeout)
        sendEvent('wsConnected')
      }
    }

    try {
      handleEvent(event)
    } catch (e) {
      ws.send('Error:' + e)
      throw e
    }
  },
  onError(event: any) {
    if (typeof event.data !== 'undefined')
      console.log('Websocket Error:' + event.data)
  }
}

function handleEvent(event: any) {
  const site = getCurrentSite()
  if (!site || !site.ready()) return ws.send('Error: Error sending event: No site found or site not ready.')

  try {
    if (event.data.toLowerCase() === 'playpause') {
      site.events.playpause?.()
    } else if (event.data.toLowerCase() === 'next') {
      site.events.next?.()
    } else if (event.data.toLowerCase() === 'previous') {
      site.events.previous?.()
    } else if (event.data.toLowerCase().includes('setposition ') || event.data.toLowerCase().includes('setprogress ')) {
      // Example string: SetPosition 34:SetProgress 0,100890207715134:
      const [positionInSeconds] = event.data.toLowerCase().split('setposition ')[1].split(':')
      const [, positionPercentage] = event.data.toLowerCase().split(':')[1].split('setprogress ')
      site.events.setPositionSeconds?.(parseInt(positionInSeconds))
      site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
    } else if (event.data.toLowerCase().includes('setvolume ')) {
      const [, volume] = event.data.split(' ')
      site.events.setVolume?.(parseInt(volume) / 100)
    } else if (event.data.toLowerCase() === 'repeat') {
      site.events.repeat?.()
    } else if (event.data.toLowerCase() === 'shuffle') {
      site.events.shuffle?.()
    } else if (event.data.toLowerCase() === 'togglethumbsup') {
      site.events.toggleThumbsUp?.()
    } else if (event.data.toLowerCase() === 'togglethumbsdown') {
      site.events.toggleThumbsDown?.()
    } else if (event.data.toLowerCase().includes('rating ')) {
      const [, rating] = event.data.split(' ')
      site.events.rating?.(parseInt(rating))
    }

    // Send update immediately, for a snappier Widget UI
    sendUpdate()
  } catch (e) {
    ws.send(`Error:Error sending event to ${site.info.player()}`)
    ws.send(`ErrorD:${e}`)
  }
}

const cache: { [key: string]: any } = {}
function sendUpdate() {
  if (!wsConnected) return

  const site = getCurrentSite()
  if (!site || !site.ready()) {
    if (cache.state !== 0) {
      ws.send('STATE:0')
      cache.state = 0
    }
    return
  }

  const values: (keyof SiteInfo)[] = ['state', 'title', 'artist', 'album', 'cover', 'duration', 'position', 'volume', 'rating', 'repeat', 'shuffle']
  values.forEach((key) => {
    try {
      let value = site.info[key]?.()
      // Check for null, and not just falsy, because 0 and '' are falsy
      if (value !== null && value !== cache[key]) {
        // For numbers, trim to 2 decimal places
        if (typeof value === 'number')
          value = parseFloat(value.toFixed(2))
        ws.send(`${key.toUpperCase()}:${value}`)
        cache[key] = value
      }
    } catch (e) {
      ws.send(`Error:Error updating ${key} for ${site.info.player()}`)
      ws.send(`ErrorD:${e}`)
    }
  })
}

// Close the websocket on page unload
window.addEventListener('beforeunload', () => {
  clearInterval(updateInterval)
  if (wsConnected && _ws.readyState === WebSocket.OPEN) {
    _ws.onclose = null
    _ws.close()
    sendEvent('wsDisconnected')
  }
})

// Only initialize the websocket we match the host
if (getCurrentSite() !== null) ws.init()