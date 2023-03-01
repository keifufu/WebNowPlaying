import { sendWsMessage } from '../shared/utils'

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
  if (!result) {
    if (type) {
      sendWsMessage({
        event: 'sendAutomaticReport',
        report: {
          message: `[${getSiteName()}] _querySelector could not get result from exec for ${type}`
        }
      })
    }
  }
  return result || defaultValue
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