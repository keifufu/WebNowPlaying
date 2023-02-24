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
  else if (host.endsWith('bandcamp.com') || document.querySelector('[content="@bandcamp"]') !== null)
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
      if (settings.isListBlocked && settings.genericList.includes(host)) return null
      if (!settings.isListBlocked && !settings.genericList.includes(host)) return null
    }
    Generic.init?.()
    return Generic
  }

  return null
}

export enum StateMode { STOPPED = 'STOPPED', PLAYING = 'PLAYING', PAUSED = 'PAUSED' }
export enum RepeatMode { NONE = 'NONE', ONE = 'ONE', ALL = 'ALL' }

type SiteInfo = {
  player: () => string // Default '' (empty string)
  state: () => StateMode // Default StateEnum.STOPPED
  title: () => string // Default '' (empty string)
  artist: () => string // Default '' (empty string)
  album: () => string // Default '' (empty string)
  cover: () => string // Default '' (empty string)
  duration: () => string // Default '0:00'
  position: () => string // Default '0:00'
  volume: (() => number) | null // Default 100
  rating: (() => number) | null // Default 0
  repeat: () => RepeatMode // Default RepeatEnum.NONE
  shuffle: () => boolean // Default false
}

export type Site = {
  init?: () => void
  ready: () => boolean,
  info: SiteInfo
  events: {
    togglePlaying: (() => void) | null
    next: (() => void) | null
    previous: (() => void) | null
    setPositionSeconds: ((positionInSeconds: number) => void) | null
    setPositionPercentage: ((progressPercentage: number) => void) | null
    setVolume: ((volume: number) => void) | null
    toggleRepeat: (() => void) | null
    toggleShuffle: (() => void) | null
    toggleThumbsUp: (() => void) | null
    toggleThumbsDown: (() => void) | null
    setRating: ((rating: number) => void) | null
  }
}

const sendEvent = (event: 'outdated' | 'wsConnected' | 'wsDisconnected') => chrome.runtime?.id && chrome.runtime.sendMessage({ event })

let reconnectCount = 0
let wsConnected = false

let outdatedTimeout: NodeJS.Timeout
let updateInterval: NodeJS.Timeout

let cache: { [key: string]: any } = {}

let _ws: WebSocket
const ws = {
  init() {
    try {
      _ws = new WebSocket(`ws://localhost:${settings.swPort}`)
      _ws.onopen = ws.onOpen
      _ws.onclose = ws.onClose
      _ws.onmessage = ws.onMessage
      _ws.onerror = ws.onError
    } catch {
      ws.retry()
    }
  },
  retry() {
    if (wsConnected) return
    cache = {}
    sendEvent('wsDisconnected')
    clearTimeout(outdatedTimeout)
    clearInterval(updateInterval)
    // exponential backoff reconnect with a max of 60 seconds
    setTimeout(() => {
      ws.init()
      reconnectCount += 1
    }, Math.min(1000 * (2 ** reconnectCount), 60000))
  },
  send(data: string) {
    if (_ws.readyState !== WebSocket.OPEN) return
    console.log(data)
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
    ws.retry()
  },
  onMessage(event: any) {
    // TODO: websocket should still connect and all even if plugin is outdated (maybe hardcode an exception for anything below 1.0.0 since communication changed there)
    if (!event.data) return
    const [type, data] = event.data.split(' ')
    if (type === 'VERSION') {
      // The version is major.minor.patch, compare version against what the extension knows is the latest version
      // C# actually gives us a version with 4 numbers, but this just ignores the last one
      const latestVersion = '0.5.0'
      const [major, minor, patch] = latestVersion.split('.').map((v) => parseInt(v))
      const [major2, minor2, patch2] = (data as string).split('.').map((v) => parseInt(v))
      if (major2 < major || (major2 === major && minor2 < minor) || (major2 === major && minor2 === minor && patch2 < patch)) {
        sendEvent('outdated')
      } else {
        clearTimeout(outdatedTimeout)
        sendEvent('wsConnected')
      }
      return
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
      console.error('WNPRedux Websocket Error:' + event.data)
  }
}

enum Events {
  TOGGLE_PLAYING,
  NEXT,
  PREVIOUS,
  SET_POSITION,
  SET_VOLUME,
  TOGGLE_REPEAT,
  TOGGLE_SHUFFLE,
  TOGGLE_THUMBS_UP,
  TOGGLE_THUMBS_DOWN,
  SET_RATING
}
// TODO: improve error logging on both sides
// TODO: fix "tabs connected"

function handleEvent(event: any) {
  const site = getCurrentSite()
  if (!site || !site.ready()) return ws.send('ERROR:Error sending event: No site found or site not ready.')
  const [type, data] = event.data.split(' ')

  try {
    switch (Events[type as keyof typeof Events]) {
      case Events.TOGGLE_PLAYING: site.events.togglePlaying?.(); break
      case Events.NEXT: site.events.next?.(); break
      case Events.PREVIOUS: site.events.previous?.(); break
      case Events.SET_POSITION: {
        const [positionInSeconds, positionPercentage] = data.split(':')
        site.events.setPositionSeconds?.(parseInt(positionInSeconds))
        site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
        break
      }
      case Events.SET_VOLUME: site.events.setVolume?.(parseInt(data)); break
      case Events.TOGGLE_REPEAT: site.events.toggleRepeat?.(); break
      case Events.TOGGLE_SHUFFLE: site.events.toggleShuffle?.(); break
      case Events.TOGGLE_THUMBS_UP: site.events.toggleThumbsUp?.(); break
      case Events.TOGGLE_THUMBS_DOWN: site.events.toggleThumbsDown?.(); break
      case Events.SET_RATING: site.events.setRating?.(parseInt(data)); break
      default: break
    }

    // Send update immediately, for a snappier Widget UI
    sendUpdate()
  } catch (e) {
    ws.send(`ERROR:Error sending event to ${site.info.player()}`)
    ws.send(`ERRORDEBUG:${e}`)
  }
}

function sendUpdate() {
  if (!wsConnected) return

  const site = getCurrentSite()
  if (!site || !site.ready()) {
    if (cache.state !== StateMode.STOPPED) {
      ws.send(`STATE:${StateMode.STOPPED}`)
      cache.state = StateMode.STOPPED
    }
    return
  }

  const values: (keyof SiteInfo)[] = ['state', 'title', 'artist', 'album', 'cover', 'duration', 'position', 'volume', 'rating', 'repeat', 'shuffle']
  values.forEach((key) => {
    try {
      let value = site.info[key]?.()
      // For numbers, round it to an integer
      if (typeof value === 'number')
        value = Math.round(value)
      // Check for null, and not just falsy, because 0 and '' are falsy
      if (value !== null && value !== cache[key]) {
        // TODO: change : to ' ' for consistency
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
});

(async () => {
  settings = await getSettings()
  // Only initialize the websocket we match the host
  if (getCurrentSite() !== null) ws.init()
})()