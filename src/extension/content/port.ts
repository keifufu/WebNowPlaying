import { randomToken } from '../../utils/misc'
import { StateMode } from '../types'
import { ContentUtils, getCurrentSite, getMediaInfo, setSendFullMediaInfo } from './utils'

let port: chrome.runtime.Port
export const initPort = async () => {
  await ContentUtils.init()
  const id = randomToken(24)
  if (getCurrentSite() !== null)
    connect(id)
}

function connect(id: string) {
  if (!chrome.runtime.id) return
  setSendFullMediaInfo(true)
  port = chrome.runtime.connect({ name: id })
  port.onDisconnect.addListener(() => connect(id))
  port.onMessage.addListener(onMessage)
}

type PortMessage = {
  event: 'getMediaInfo' | 'executeMediaEvent',
  communicationRevision?: 'legacy' | '1' | '2',
  mediaEventData?: string,
}

function onMessage(message: PortMessage, port: chrome.runtime.Port) {
  switch (message.event) {
    case 'getMediaInfo': {
      const mediaInfo = getMediaInfo()
      if (!mediaInfo) return
      port.postMessage({
        event: 'mediaInfo',
        mediaInfo: mediaInfo
      })
      break
    }
    case 'executeMediaEvent':
      if (!message.communicationRevision || !message.mediaEventData) return
      switch (message.communicationRevision) {
        case 'legacy':
          OnMediaEventLegacy(message.mediaEventData)
          break
        case '1':
          OnMediaEventRev1(message.mediaEventData)
          break
        case '2':
          OnMediaEventRev2(message.mediaEventData)
          break
        default: break
      }
      break
    default: break
  }
}

function OnMediaEventLegacy(message: string) {
  try {
    enum Events {
      PLAYPAUSE,
      PREVIOUS,
      NEXT,
      SETPOSITION,
      SETVOLUME,
      REPEAT,
      SHUFFLE,
      TOGGLETHUMBSUP,
      TOGGLETHUMBSDOWN,
      RATING
    }

    const site = getCurrentSite()
    if (!site || !site.ready()) return null

    const [type, data] = message.toUpperCase().split(' ')
    switch (Events[type as keyof typeof Events]) {
      case Events.PLAYPAUSE: site.events.setState?.(site.info.state() === StateMode.PLAYING ? StateMode.PAUSED : StateMode.PLAYING); break
      case Events.PREVIOUS: site.events.skipPrevious?.(); break
      case Events.NEXT: site.events.skipNext?.(); break
      case Events.SETPOSITION: {
        // Example string: SetPosition 34:SetProgress 0,100890207715134:
        const [positionInSeconds, positionPercentageStr] = data.split(':')
        const positionPercentage = positionPercentageStr.split('SETPROGRESS ')[1]
        site.events.setPositionSeconds?.(parseInt(positionInSeconds))
        // We replace(',', '.') because all legacy versions didn't use InvariantCulture
        site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
        break
      }
      case Events.SETVOLUME: site.events.setVolume?.(parseInt(data)); break
      case Events.REPEAT: site.events.toggleRepeatMode?.(); break
      case Events.SHUFFLE: site.events.toggleShuffleActive?.(); break
      case Events.TOGGLETHUMBSUP: site.events.setRating?.(site.info.rating() === 5 ? 0 : 5); break
      case Events.TOGGLETHUMBSDOWN: site.events.setRating?.(site.info.rating() === 1 ? 0 : 1); break
      case Events.RATING: site.events.setRating?.(parseInt(data)); break
      default: break
    }
  } catch (err) {
    // ignore, optimally send it back to ws
  }
}

function OnMediaEventRev1(message: string) {
  try {
    enum Events {
      TOGGLE_PLAYING,
      PREVIOUS,
      NEXT,
      SET_POSITION,
      SET_VOLUME,
      TOGGLE_REPEAT,
      TOGGLE_SHUFFLE,
      TOGGLE_THUMBS_UP,
      TOGGLE_THUMBS_DOWN,
      SET_RATING
    }

    const site = getCurrentSite()
    if (!site || !site.ready()) return null
    const [type, data] = message.toUpperCase().split(' ')

    switch (Events[type as keyof typeof Events]) {
      case Events.TOGGLE_PLAYING: site.events.setState?.(site.info.state() === StateMode.PLAYING ? StateMode.PAUSED : StateMode.PLAYING); break
      case Events.PREVIOUS: site.events.skipPrevious?.(); break
      case Events.NEXT: site.events.skipNext?.(); break
      case Events.SET_POSITION: {
        const [positionInSeconds, positionPercentage] = data.split(':')
        site.events.setPositionSeconds?.(parseInt(positionInSeconds))
        // We still replace(',', '.') because v1.0.0 - v1.0.5 didn't use InvariantCulture
        site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
        break
      }
      case Events.SET_VOLUME: site.events.setVolume?.(parseInt(data)); break
      case Events.TOGGLE_REPEAT: site.events.toggleRepeatMode?.(); break
      case Events.TOGGLE_SHUFFLE: site.events.toggleShuffleActive?.(); break
      case Events.TOGGLE_THUMBS_UP: site.events.setRating?.(site.info.rating() === 5 ? 0 : 5); break
      case Events.TOGGLE_THUMBS_DOWN: site.events.setRating?.(site.info.rating() === 1 ? 0 : 1); break
      case Events.SET_RATING: site.events.setRating?.(parseInt(data)); break
      default: break
    }
  } catch (err) {
    // ignore, optimally send it back to ws
  }
}

function OnMediaEventRev2(message: string) {
  try {
    enum Events {
      TRY_SET_STATE,
      TRY_SKIP_PREVIOUS,
      TRY_SKIP_NEXT,
      TRY_SET_POSITION,
      TRY_SET_VOLUME,
      TRY_TOGGLE_REPEAT_MODE,
      TRY_TOGGLE_SHUFFLE_ACTIVE,
      TRY_SET_RATING
    }

    const site = getCurrentSite()
    if (!site || !site.ready()) return null
    const [type, data] = message.toUpperCase().split(' ')

    switch (Events[type as keyof typeof Events]) {
      case Events.TRY_SET_STATE: site.events.setState?.(data === 'PLAYING' ? StateMode.PLAYING : StateMode.PAUSED); break
      case Events.TRY_SKIP_PREVIOUS: site.events.skipPrevious?.(); break
      case Events.TRY_SKIP_NEXT: site.events.skipNext?.(); break
      case Events.TRY_SET_POSITION: {
        const [positionInSeconds, positionPercentage] = data.split(':')
        site.events.setPositionSeconds?.(parseInt(positionInSeconds))
        site.events.setPositionPercentage?.(parseFloat(positionPercentage))
        break
      }
      case Events.TRY_SET_VOLUME: site.events.setVolume?.(parseInt(data)); break
      case Events.TRY_TOGGLE_REPEAT_MODE: site.events.toggleRepeatMode?.(); break
      case Events.TRY_TOGGLE_SHUFFLE_ACTIVE: site.events.toggleShuffleActive?.(); break
      case Events.TRY_SET_RATING: site.events.setRating?.(parseInt(data)); break
      default: break
    }
  } catch (err) {
    // ignore, optimally send it back to ws
  }
}