import { isVersionOutdated } from '../../utils/misc'
import { Adapter, CustomAdapter } from '../../utils/settings'
import { MediaInfo, RepeatMode, StateMode } from '../types'
import { getGithubVersion, setOutdated } from './shared'

export class WNPReduxWebSocket {
  ws: WebSocket | null = null
  adapter: Adapter | CustomAdapter
  cache = new Map<string, any>()
  reconnectAttempts = 0
  communicationRevision: string | null = null
  connectionTimeout: NodeJS.Timeout | null = null
  reconnectTimeout: NodeJS.Timeout | null = null
  isClosed = false
  executeEvent: (communicationRevision: string, data: string) => void

  constructor(adapter: Adapter | CustomAdapter, executeEvent: (communicationRevision: string, data: string) => void) {
    this.adapter = adapter
    this.executeEvent = executeEvent
    this.init()
  }

  private init() {
    // try/catch does nothing. If the connection fails, it will call onError.
    // The extension will only log errors to chrome://extensions if it's loaded unpacked.
    // It won't show those errors to the user.
    this.ws = new WebSocket(`ws://127.0.0.1:${this.adapter.port}`)
    this.ws.onopen = this.onOpen.bind(this)
    this.ws.onclose = this.onClose.bind(this)
    this.ws.onerror = this.onError.bind(this)
    this.ws.onmessage = this.onMessage.bind(this)
  }

  public close(cleanupOnly = false) {
    if (!cleanupOnly) this.isClosed = true
    this.cache = new Map<string, any>()
    this.communicationRevision = null
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout)
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
    }
  }

  private retry() {
    if (this.isClosed) return
    this.close(true)
    // Reconnects once per second for 30 seconds, then with a exponential backoff of (2^reconnectAttempts) up to 60 seconds
    this.reconnectTimeout = setTimeout(() => {
      this.init()
      this.reconnectAttempts += 1
    }, Math.min(1000 * (this.reconnectAttempts <= 30 ? 1 : (2 ** (this.reconnectAttempts - 30))), 60000))
  }

  public send(data: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(data)
  }

  private onOpen() {
    this.reconnectAttempts = 0
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
          this.executeEvent('legacy', event.data)
          break
        case '1':
          this.executeEvent('1', event.data)
          break
        default: break
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (event.data.startsWith('Version:')) {
        // 'Version:' WNP for Rainmeter 0.5.0 (legacy)
        this.communicationRevision = 'legacy'
        setOutdated()
      } else if (event.data.startsWith('ADAPTER_VERSION ')) {
        // Any WNPRedux adapter will send 'ADAPTER_VERSION <version>;WNPRLIB_REVISION <revision>' after connecting
        this.communicationRevision = event.data.split(';')[1].split(' ')[1]
        // Check if the adapter is outdated
        const adapterVersion = event.data.split(' ')[1].split(';')[0]
        if ((this.adapter as Adapter).gh) {
          const githubVersion = await getGithubVersion((this.adapter as Adapter).gh)
          if (githubVersion === 'Error') return
          if (isVersionOutdated(adapterVersion, githubVersion)) setOutdated()
        }
      } else {
        // The first message wasn't version related, so it's probably WNP for Rainmeter < 0.5.0 (legacy)
        this.communicationRevision = 'legacy'
        setOutdated()
      }
    }
  }

  public sendUpdate(mediaInfo: MediaInfo) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    switch (this.communicationRevision) {
      case 'legacy':
        SendMediaInfoLegacy(this, mediaInfo)
        break
      case '1':
        SendMediaInfoRev1(this, mediaInfo)
        break
      default: break
    }
  }
}

function SendMediaInfoRev1(self: WNPReduxWebSocket, mediaInfo: MediaInfo) {
  for (const key in mediaInfo) {
    if (key === 'timestamp') return
    const value = mediaInfo[key as keyof MediaInfo]
    // Check for null, and not just falsy, because 0 and '' are falsy
    if (value !== null && value !== self.cache.get(key)) {
      self.send(`${key.toUpperCase()} ${value}`)
      self.cache.set(key, value)
    }
  }
}

function SendMediaInfoLegacy(self: WNPReduxWebSocket, mediaInfo: MediaInfo) {
  for (const key in mediaInfo) {
    if (key === 'timestamp') return
    let value = mediaInfo[key as keyof MediaInfo]

    // Conversion to legacy values
    if (key === 'state')
      value = value === StateMode.PLAYING ? 1 : value === StateMode.PAUSED ? 2 : 0
    else if (key === 'repeat')
      value = value === RepeatMode.ALL ? 2 : value === RepeatMode.ONE ? 1 : 0
    else if (key === 'shuffle')
      value = value ? 1 : 0

    // Check for null, and not just falsy, because 0 and '' are falsy
    if (value !== null && value !== self.cache.get(key)) {
      self.send(`${key.toUpperCase()}:${value}`)
      self.cache.set(key, value)
    }
  }
}