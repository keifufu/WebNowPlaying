import { Adapter, BuiltInAdapters, CustomAdapter, Settings, SocketInfoMap, defaultSocketInfo } from '../../utils/settings'
import { MediaInfo, StateMode, defaultMediaInfo } from '../types'
import { readSettings } from './shared'
import { WNPReduxWebSocket } from './socket'

type PortMessage = {
  event: 'mediaInfo',
  mediaInfo: Partial<MediaInfo>
}

const disconnectTimeouts = new Map<string, NodeJS.Timeout>()
const mediaInfoDictionary = new Map<string, MediaInfo>()
const ports = new Map<string, chrome.runtime.Port>()
const sockets = new Map<number, WNPReduxWebSocket>()
let mediaInfoId: string | null = null

const updateAll = () => {
  for (const socket of sockets.values()) {
    const mediaInfo = mediaInfoDictionary.get(mediaInfoId || '') || defaultMediaInfo
    socket.sendUpdate(mediaInfo)
  }
}

const executeEvent = (communicationRevision: string, mediaEventData: string) => {
  if (!mediaInfoId) return
  ports.get(mediaInfoId)?.postMessage({
    event: 'executeMediaEvent',
    communicationRevision,
    mediaEventData
  })
  ports.get(mediaInfoId)?.postMessage({ event: 'getMediaInfo' })
  updateAll()
}

const updateMediaInfo = () => {
  const sortedDictionary = new Map([...mediaInfoDictionary].sort((a, b) => b[1].timestamp - a[1].timestamp))
  let suitableMatch = false

  for (const [key, value] of sortedDictionary) {
    if (value.state === StateMode.PLAYING && value.volume > 0) {
      mediaInfoId = key
      suitableMatch = true
      break
    }
  }

  if (!suitableMatch) {
    const fallback = sortedDictionary.size > 0 ? sortedDictionary.entries().next().value : null
    if (fallback)
      mediaInfoId = fallback[0]
    else
      mediaInfoId = null
  }
  updateAll()
}

interface Port extends chrome.runtime.Port {
  _timer: any
}

chrome.runtime.onConnect.addListener((_port) => {
  const port = _port as Port
  clearTimeout(disconnectTimeouts.get(port.name))
  disconnectTimeouts.delete(port.name)
  ports.set(port.name, port)
  port.onMessage.addListener((message) => onMessage(message, port))
  port.onDisconnect.addListener(() => {
    // This only gets fired if the other side disconnects, not if we disconnect from here.
    deleteTimer(port)
    ports.delete(port.name)
    // It should reconnect immediately, 500ms is more than enough.
    disconnectTimeouts.set(port.name, setTimeout(() => {
      mediaInfoDictionary.delete(port.name)
      updateMediaInfo()
    }, 500))
  })
  port._timer = setTimeout(() => {
    deleteTimer(port)
    ports.delete(port.name)
    port.disconnect()
  }, 250e3, port)
})

function onMessage(message: PortMessage, port: Port) {
  switch (message.event) {
    case 'mediaInfo': {
      const currentMediaInfo = { ...mediaInfoDictionary.get(port.name) ?? defaultMediaInfo, ...message.mediaInfo }
      mediaInfoDictionary.set(port.name, currentMediaInfo)

      let shouldUpdate = false
      for (const key in message.mediaInfo)
        if (key !== 'position') shouldUpdate = true

      if (shouldUpdate && currentMediaInfo.title.length > 0)
        updateMediaInfo()

      updateAll()
      break
    }
    default: break
  }
}

function deleteTimer(port: Port) {
  if (port._timer) {
    clearTimeout(port._timer)
    delete port._timer
  }
}

export const initPort = async () => {
  await reloadSockets()
}

let _settings: Settings
// We want to update settings after they change, we don't want to read them every time (in getSocketInfo particularly)
export const updateSettings = async () => {
  _settings = await readSettings()
}
let _interval: NodeJS.Timeout | null = null
export const reloadSockets = async () => {
  _settings = await readSettings()
  if (_interval) clearInterval(_interval)
  // Close all sockets
  for (const [key, socket] of sockets.entries()) {
    socket.close()
    sockets.delete(key)
  }
  // Open all sockets
  for (const adapter of BuiltInAdapters) {
    if (_settings.enabledBuiltInAdapters.includes(adapter.name))
      sockets.set(adapter.port, new WNPReduxWebSocket(adapter, executeEvent))
  }
  for (const adapter of _settings.customAdapters) {
    if (adapter.enabled && adapter.port !== 0)
      sockets.set(adapter.port, new WNPReduxWebSocket(adapter, executeEvent))
  }

  _interval = setInterval(() => {
    for (const port of ports.values()) {
      port.postMessage({ event: 'getMediaInfo' })
      // Running updateAll in an interval shouldn't hurt, as it will only send an update if the mediaInfo has changed.
      // We do this because otherwise newly connected sockets don't send any info until something changed.
      updateAll()
    }
  }, _settings.updateFrequencyMs2)
}

export const connectSocket = async (port: number) => {
  _settings = await readSettings()
  let adapter: Adapter | CustomAdapter | undefined = BuiltInAdapters.find((a) => a.port === port)
  if (!adapter) adapter = _settings.customAdapters.find((a) => a.port === port)
  if (!adapter) return

  if (sockets.has(port)) return
  sockets.set(adapter.port, new WNPReduxWebSocket(adapter, executeEvent))
}

export const disconnectSocket = (port: number) => {
  const socket = sockets.get(port)
  if (!socket) return
  socket.close()
  sockets.delete(port)
}

export const getSocketInfo = () => {
  const info: SocketInfoMap = new Map()

  for (const [key, socket] of sockets.entries()) {
    info.set(key, {
      version: socket.version,
      isConnected: socket.isConnected,
      isConnecting: socket.isConnecting,
      reconnectAttempts: socket.reconnectAttempts
    })
  }

  // Fill in info for not connected sockets
  for (const adapter of BuiltInAdapters) {
    if (info.has(adapter.port)) continue
    info.set(adapter.port, {
      ...defaultSocketInfo,
      _isPlaceholder: false
    })
  }

  for (const adapter of _settings?.customAdapters) {
    if (info.has(adapter.port)) continue
    info.set(adapter.port, {
      ...defaultSocketInfo,
      _isPlaceholder: false
    })
  }

  return info
}