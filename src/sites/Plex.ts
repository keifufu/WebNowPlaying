import { Site } from '../content'
import { getMediaSessionCover, timeInSecondsToString } from '../utils'

const site: Site = {
  ready: () => {
    const video = document.querySelector('video')
    return video !== null && video.duration > 0
  },
  info: {
    player: () => 'Plex',
    state: () => {
      const video = document.querySelector('video')
      return video?.paused ? 2 : 1
    },
    title: () => document.querySelector<HTMLElement>('[class*="MetadataPosterTitle-title"]')?.innerText || '',
    artist: () => document.querySelector<HTMLElement>('[data-testid="metadataYear"]')?.innerText || '',
    album: () => '',
    cover: () => getMediaSessionCover(),
    duration: () => timeInSecondsToString(document.querySelector('video')?.duration || 0),
    position: () => timeInSecondsToString(document.querySelector('video')?.currentTime || 0),
    volume: () => (document.querySelector('video')?.volume || 1) * 100,
    rating: () => 0,
    repeat: () => {
      const repeatButton = document.querySelector('button[data-testid="repeatButton"]')
      if (repeatButton) {
        if (repeatButton.className.includes('Active')) return 2
      } else {
        const repeatOneButton = document.querySelector('button[data-testid="repeatOneButton"]')
        if (repeatOneButton) return 1
      }
      return 0
    },
    shuffle: () => (document.querySelector('button[data-testid="shuffleButton"]')?.className.includes('Active') ? 1 : 0)
  },
  events: {
    playpause: () => {
      const button = document.querySelector('button[data-testid="pauseButton"]') || document.querySelector('button[data-testid="resumeButton"]')
      if (!button) return
      button.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      button.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
    },
    next: () => {
      const button = document.querySelector('button[data-testid="nextButton"]')
      if (!button) return
      button.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      button.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
    },
    previous: () => {
      const button = document.querySelector('button[data-testid="previousButton"]')
      if (!button) return
      button.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      button.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
    },
    setPositionSeconds: (positionInSeconds: number) => {
      const video = document.querySelector('video')
      if (video) video.currentTime = positionInSeconds
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      const video = document.querySelector('video')
      if (video) {
        video.volume = volume
        if (volume === 0) video.muted = true
        else video.muted = false
      }
    },
    repeat: () => {
      const button = document.querySelector('button[data-testid="repeatButton"]') || document.querySelector('button[data-testid="repeatOneButton"]')
      if (!button) return
      button.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      button.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
    },
    shuffle: () => {
      const button = document.querySelector('button[data-testid="shuffleButton"]')
      if (!button) return
      button.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      button.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
    },
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    rating: null
  }
}

export default site