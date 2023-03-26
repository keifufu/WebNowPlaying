import { YouTubeVideoDetails } from '../types'

export { }

window.addEventListener('message', (e: any) => {
  if (e.data.type === 'wnp-message') {
    switch (e.data.event) {
      case 'getYouTubeInfo':
        window.postMessage({
          id: e.data.id,
          type: 'wnp-response',
          value: {
            videoDetails: getVideoDetails(),
            playlistDetails: findKey(getYouTubeContainer()?.querySelector('#playlist'), 'data'),
            containerLocalName: getYouTubeContainer()?.localName
          }
        }, '*')
        break
      case 'getYouTubeMusicVolume':
        window.postMessage({
          id: e.data.id,
          type: 'wnp-response',
          value: (document.querySelector('ytmusic-player-bar') as any)?.playerApi_?.getVolume?.()
        }, '*')
        break
      case 'setYouTubeMusicVolume':
        (document.querySelector('ytmusic-player-bar') as any)?.playerApi_?.setVolume?.(e.data.data)
        window.postMessage({
          id: e.data.id,
          type: 'wnp-response',
          value: null
        }, '*')
        break
      default:
        window.postMessage({
          id: e.data.id,
          type: 'wnp-response',
          value: null
        }, '*')
    }
  }
})

function findKey(obj: any, key: string): any {
  if (typeof obj !== 'object' || obj === null) return null
  const value = typeof obj.get === 'function' ? obj.get(key) : obj[key]
  if (value !== undefined && value !== null) return value
  // Keys can be 'a.b.c' to find nested objects
  const keys = key.split('.')
  let prop = obj
  for (const key of keys) {
    prop = prop?.[key]
    if (!prop) break
  }
  if (prop) return prop
  return null
}

function getYouTubeContainer(): Element | null {
  const previewPlayer = document.querySelector('ytd-video-preview')
  if (findKey(previewPlayer, 'active')) return previewPlayer
  const shortsPlayer = document.querySelector('ytd-shorts')
  if (findKey(shortsPlayer, 'active')) return shortsPlayer
  const miniPlayer = document.querySelector('ytd-miniplayer')
  if (findKey(miniPlayer, 'active')) return miniPlayer
  const flexyPlayer = document.querySelector('ytd-watch-flexy')
  if (findKey(flexyPlayer, 'active')) return flexyPlayer
  return null
}

function getVideoDetails(): YouTubeVideoDetails {
  let details
  const container = getYouTubeContainer()
  if (!container) return {}
  switch (container.localName) {
    case 'ytd-video-preview':
      details = findKey(container, 'videoPreviewFetchRequest.result_.videoDetails')
      break
    case 'ytd-miniplayer':
      details = findKey(container, 'watchResponse.playerResponse.videoDetails')
      break
    case 'ytd-shorts':
    case 'ytd-watch-flexy':
      details = findKey(container, 'playerData.videoDetails')
      break
    default:
      details = findKey(document.querySelector('ytd-app'), 'data.playerResponse.videoDetails')
  }
  return details ?? {}
}
