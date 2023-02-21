/* eslint-disable no-loop-func */
/* eslint-disable prefer-destructuring */
import { Site } from '../content'
import { capitalize, getMediaSessionCover, timeInSecondsToString } from '../utils'

// Mostly also copied from the original extension, other than refactoring it and adding
// partial mediaSession support, the original was already good enough.

let element: HTMLMediaElement
let artistFromTitle = ''

// Function that sanitizes a title from unicode characters like '◼ ❙❙ ❚❚ ► ▮▮ ▶ ▷ ❘ ❘ ▷' and trim double whitespace
// Easy website for unicode lookup: https://unicodeplus.com
const sanitizeTitle = (title: string) => title.replace(/[\u25A0\u2759\u275A\u25AE\u25AE\u25B6\u25BA\u25B7\u2758\u25FC]/g, '').trim().replace(/\s+/g, ' ')

let isInitialized = false
let updateInterval: NodeJS.Timeout
const site: Site = {
  init: () => {
    if (isInitialized) return
    isInitialized = true
    console.log('Initializing generic site')
    // Setup events on all elements to get when updated (Also called in readyCheck)
    setupElementEvents()
    // This will update which element is selected to display
    updateInterval = setInterval(() => {
      updateCurrentElement()
    }, 1000)
  },
  ready: () => {
    // Most elements will already have events attached but this will add it to any new elements
    setupElementEvents()
    return element !== undefined && element !== null && element.duration > 0
  },
  info: {
    player: () => capitalize(window.location.hostname.split('.').slice(-2).join('.')),
    // navigator.mediaSession.state is barely ever set, so don't even bother with it
    state: () => {
      if (!element) return 0
      if (element.paused) return 2
      else return 1
    },
    title: () => {
      if (navigator.mediaSession.metadata?.title)
        return navigator.mediaSession.metadata.title

      let title = ''

      const ogTitle = document.querySelector('meta[property="og:title"]')
      const metaTitle = document.querySelector('meta[name="title"]')
      if (ogTitle !== null && ogTitle.getAttribute('content'))
        title = ogTitle.getAttribute('content') as string
      else if (metaTitle !== null && metaTitle.getAttribute('content'))
        title = metaTitle.getAttribute('content') as string
      else
        title = document.title

      title = sanitizeTitle(title)

      // Try to parse the title to see if it contains the artist info
      // These might sometimes work, but might cause many false positives: | -
      if (title.includes(', by')) {
        const parts = title.split(', by')
        title = parts[0].trim()
        artistFromTitle = parts[1].trim()
      } else if (title.includes('by:')) {
        const parts = title.split('by:')
        title = parts[0].trim()
        artistFromTitle = parts[1].trim()
      }

      return title
    },
    artist: () => {
      if (navigator.mediaSession.metadata?.artist)
        return navigator.mediaSession.metadata.artist

      if (artistFromTitle !== '')
        return artistFromTitle

      // Returns 'Youtube' for youtube.com, 'Spotify' for open.spotify.com, etc.
      return capitalize(document.location.hostname.split('.').slice(-2)[0])
    },
    album: () => {
      if (navigator.mediaSession.metadata?.album)
        return navigator.mediaSession.metadata.album

      // I think it's better to return no album if there is no way to get it.
      // The original generic script returned the same as artist above (the site's name)
      return ''
    },
    cover: () => {
      if ((navigator.mediaSession.metadata?.artwork?.length || 0) > 0)
        return getMediaSessionCover()

      if (element && element.getAttribute('poster'))
        return element.getAttribute('poster') as string

      const ogImage = document.querySelector('meta[property="og:image"]')
      if (ogImage !== null && ogImage.getAttribute('content'))
        return ogImage.getAttribute('content') as string

      return ''
    },
    // Sometimes, the duration and position returned can seem weird
    // I noticed that on adultswim, it's because the video is buffering
    // and the duration keeps increasing? Either way, it doesn't seem
    // to be an issue with timeInstantToString, and not with
    // element.duration/element.currentTime.
    duration: () => timeInSecondsToString(element?.duration || 0),
    position: () => timeInSecondsToString(element?.currentTime || 0),
    volume: () => (element?.muted ? 0 : (element?.volume || 0) * 100),
    rating: () => 0,
    repeat: () => (element?.loop ? 1 : 0),
    shuffle: () => 0
  },
  events: {
    playpause: () => {
      if (!element) return
      if (element.paused) element.play()
      else element.pause()
    },
    next: () => {
      if (!element) return
      element.currentTime = element.duration
    },
    previous: () => {
      if (!element) return
      element.currentTime = 0
    },
    setPositionSeconds: (positionInSeconds: number) => {
      if (!element) return
      element.currentTime = positionInSeconds
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      if (!element) return
      if (element.muted) element.muted = false
      if (volume === 0) element.muted = true
      element.volume = volume
    },
    repeat: () => {
      if (!element) return
      element.loop = !element.loop
    },
    shuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    rating: null
  }
}

window.addEventListener('beforeunload', () => {
  clearInterval(updateInterval)
})

// This is barely refactored, I decided to just copy it from the original extension
// The comments below THIS line are also from the original, as reference.

// Proposed solution for dynamic instancing of content:
// Came up with for Pandora and improved to make it more dynamic

// Basically it adds to every element a function to call on time update
// This then accumulates sources that have updated until the current element is requested
// If the last returned element is in the updated list then it is returned
// If it is not then whatever element was updated the most recently is returned
// If the list is empty then it returns the last used element
// If no element has been used in the past then it returns the first video element in that page
// If there is no video element then it returns the first audio element in that page
// If these is no elements at all then it returns null
// At that point in time the accumlated elements are purged from the list
let elements: any[] = []
function updateCurrentElement() {
  // If any elements have been updated since last check
  if (elements.length > 0) {
    // If last used element does not exist in array select a new one
    if (elements.indexOf(element) < 0) {
      // Update element to the element that came in most recently
      // @TODO make this ignore elements that are muted or have no sound
      // @TODO prioritize elements in the list that had a state or src change more recently to break ties
      element = elements[elements.length - 1]
    }
  // No elements have been updated, only try to change element if it is null
  } else if (!element) {
    // Check all audio elements and set element to the first one with any length
    for (let i = 0; i < document.getElementsByTagName('audio').length; i++) {
      if (document.getElementsByTagName('audio')[i].duration > 0) {
        element = document.getElementsByTagName('audio')[i]
        break
      }
    }
    // If no suitable audio element was found try to check for video elements
    if (!element) {
      // @TODO check if there is a way to see if a video has audio
      for (let i = 0; i < document.getElementsByTagName('video').length; i++) {
        if (document.getElementsByTagName('video')[i].duration > 0) {
          element = document.getElementsByTagName('video')[i]
          break
        }
      }
    }
  }

  // Clear array of updated elements
  elements = []
}

function setupElementEvents() {
  for (let i = 0; i < document.getElementsByTagName('video').length; i++) {
    if (document.getElementsByTagName('video')[i].ontimeupdate === null) {
      document.getElementsByTagName('video')[i].ontimeupdate = function() {
        elements.push(this)
      }
    }
  }
  for (let i = 0; i < document.getElementsByTagName('audio').length; i++) {
    // @TODO may have to not check if null in case someone else has a time update event already (Although in those cases I may break their site)
    if (document.getElementsByTagName('audio')[i].ontimeupdate === null) {
      document.getElementsByTagName('audio')[i].ontimeupdate = () => function() {
        elements.push(this)
      }
    }
  }
}

export default site