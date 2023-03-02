import { Adapter, BuiltInAdapters, CustomAdapter, defaultSettings, defaultUpdateFrequencyMs, isVersionOutdated, sendWsMessage, Settings } from '../shared/utils'
import { OnMessageLegacy, OnMessageRev1, SendUpdateLegacy, SendUpdateRev1 } from './handlers'
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

export enum StateMode { STOPPED = 'STOPPED', PLAYING = 'PLAYING', PAUSED = 'PAUSED' }
export enum RepeatMode { NONE = 'NONE', ONE = 'ONE', ALL = 'ALL' }

export type SiteInfo = {
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

// Loaded on page load (bottom of content.ts)
let settings: Settings = defaultSettings

export function getCurrentSite() {
  const host = window.location.hostname

  // prioritize matching youtube.com/embed before youtube.com
  if (host === 'www.youtube.com' && window.location.pathname.startsWith('/embed') && !settings.disabledSites.includes('Youtube Embeds'))
    return YoutubeEmbed

  if (host === 'music.apple.com' && !settings.disabledSites.includes('Apple Music'))
    return Applemusic
  else if ((host.endsWith('bandcamp.com') || document.querySelector('[content="@bandcamp"]') !== null) && !settings.disabledSites.includes('Bandcamp'))
    return Bandcamp
  else if (host === 'www.deezer.com' && !settings.disabledSites.includes('Deezer'))
    return Deezer
  else if (host === 'www.pandora.com' && !settings.disabledSites.includes('Pandora'))
    return Pandora
  else if (host === 'app.plex.tv' && !settings.disabledSites.includes('Plex'))
    return Plex
  else if (host === 'soundcloud.com' && !settings.disabledSites.includes('Soundcloud'))
    return Soundcloud
  else if (host === 'open.spotify.com' && !settings.disabledSites.includes('Spotify'))
    return Spotify
  else if (host === 'listen.tidal.com' && !settings.disabledSites.includes('Tidal'))
    return Tidal
  else if (host === 'www.twitch.tv' && !settings.disabledSites.includes('Twitch'))
    return Twitch
  else if (host === 'www.youtube.com' && !settings.disabledSites.includes('Youtube'))
    return Youtube
  else if (host === 'music.youtube.com' && !settings.disabledSites.includes('Youtube Music'))
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

export class WNPReduxWebSocket {
  _ws: WebSocket | null = null
  _adapter: Adapter | CustomAdapter
  cache: { [key: string]: any } = {}
  reconnectCount = 0
  updateInterval: NodeJS.Timeout | null = null
  communicationRevision: string | null = null
  connectionTimeout: NodeJS.Timeout | null = null

  constructor(adapter: Adapter | CustomAdapter) {
    this._adapter = adapter
    this.init()
  }

  private init() {
    try {
      this._ws = new WebSocket(`ws://localhost:${this._adapter.port}`)
      this._ws.onopen = this.onOpen.bind(this)
      this._ws.onclose = this.onClose.bind(this)
      this._ws.onerror = this.onError.bind(this)
      this._ws.onmessage = this.onMessage.bind(this)
    } catch {
      this.retry()
    }
  }

  public close() {
    if (this.updateInterval) clearInterval(this.updateInterval)
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.onclose = null
      this._ws.close()
    }
  }

  // Clean up old variables and retry connection
  private retry() {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) return
    this.cache = {}
    this.communicationRevision = null
    if (this.updateInterval) clearInterval(this.updateInterval)
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout)
    // exponential backoff reconnect with a max of 60 seconds
    setTimeout(() => {
      this.init()
      this.reconnectCount += 1
    }, Math.min(1000 * (2 ** this.reconnectCount), 60000))
  }

  public send(data: string) {
    if (!this._ws || this._ws.readyState !== WebSocket.OPEN) return
    this._ws.send(data)
  }

  private onOpen() {
    this.reconnectCount = 0
    this.updateInterval = setInterval(this.sendUpdate.bind(this), settings.updateFrequencyMs[this._adapter.port] || defaultUpdateFrequencyMs)
    // If no communication revision is received within 1 second, assume it's WNP for Rainmeter < 0.5.0 (legacy)
    this.connectionTimeout = setTimeout(() => {
      if (this.communicationRevision === null) this.communicationRevision = 'legacy'
    }, 1000)
  }

  private onClose() {
    this.retry()
  }

  private onError() {
    this.retry()
  }

  private async onMessage(event: MessageEvent<string>) {
    if (this.communicationRevision) {
      switch (this.communicationRevision) {
        case 'legacy':
          OnMessageLegacy(this, event.data)
          break
        case '1':
          OnMessageRev1(this, event.data)
          break
        default: break
      }

      // Send an update for all connected adapters
      updateAll()
    } else {
      // eslint-disable-next-line no-lonely-if
      if (event.data.startsWith('Version:')) {
        // 'Version:' WNP for Rainmeter 0.5.0 (legacy)
        this.communicationRevision = 'legacy'
        sendWsMessage({ event: 'setOutdated' })
      } else if (event.data.startsWith('ADAPTER_VERSION ')) {
        // Any WNPRedux adapter will send 'ADAPTER_VERSION <version>;WNPRLIB_REVISION <revision>' after connecting
        this.communicationRevision = event.data.split(';')[1].split(' ')[1]
        // Check if the adapter is outdated
        const adapterVersion = event.data.split(' ')[1].split(';')[0]
        if ((this._adapter as Adapter).gh) {
          const githubVersion = await sendWsMessage({ event: 'getGithubVersion', gh: (this._adapter as Adapter).gh })
          if (githubVersion === 'Error') return
          if (isVersionOutdated(adapterVersion, githubVersion)) sendWsMessage({ event: 'setOutdated' })
        }
      } else {
        // The first message wasn't version related, so it's probably WNP for Rainmeter < 0.5.0 (legacy)
        this.communicationRevision = 'legacy'
        sendWsMessage({ event: 'setOutdated' })
      }
    }
  }

  public sendUpdate() {
    if (!this._ws || this._ws.readyState !== WebSocket.OPEN) return
    switch (this.communicationRevision) {
      case 'legacy':
        SendUpdateLegacy(this)
        break
      case '1':
        SendUpdateRev1(this)
        break
      default: break
    }
  }
}

const sockets: WNPReduxWebSocket[] = []

// Close the websockets on page unload
window.addEventListener('beforeunload', () => {
  sockets.forEach((socket) => {
    socket.close()
  })
})

function updateAll() {
  sockets.forEach((socket) => {
    socket.sendUpdate()
  })
}

(async () => {
  settings = await sendWsMessage({ event: 'getSettings' })
  // Only initialize the websocket we match the host
  if (getCurrentSite() !== null) {
    BuiltInAdapters.forEach((adapter) => {
      if (settings.disabledBuiltInAdapters.includes(adapter.name)) return
      sockets.push(new WNPReduxWebSocket(adapter))
    })
    settings.customAdapters.forEach((adapter) => {
      if (!adapter.enabled || adapter.port === 0) return
      sockets.push(new WNPReduxWebSocket(adapter))
    })
  }
})()

matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (e.matches) sendWsMessage({ event: 'setColorScheme', colorScheme: 'light' })
  else sendWsMessage({ event: 'setColorScheme', colorScheme: 'dark' })
})