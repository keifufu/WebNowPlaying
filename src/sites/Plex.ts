import { RepeatMode, Site, StateMode } from '../content'
import { getMediaSessionCover, querySelector, querySelectorEventReport, querySelectorReport, timeInSecondsToString } from '../utils'

const site: Site = {
  ready: () => querySelector<boolean, HTMLVideoElement>('video', (el) => el !== null && el.duration > 0, false),
  info: {
    player: () => 'Plex',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.STOPPED, 'state'),
    title: () => querySelectorReport<string, HTMLElement>('[class*="MetadataPosterTitle-title"]', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLElement>('[data-testid="metadataYear"]', (el) => el.innerText, '', 'artist'),
    album: () => '',
    cover: () => getMediaSessionCover(),
    duration: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => 0,
    repeat: () => {
      const repeatButton = document.querySelector('button[data-testid="repeatButton"]')
      if (repeatButton) {
        if (repeatButton.className.includes('Active')) return RepeatMode.ALL
      } else {
        const repeatOneButton = document.querySelector('button[data-testid="repeatOneButton"]')
        if (repeatOneButton) return RepeatMode.ONE
      }
      return RepeatMode.NONE
    },
    shuffle: () => querySelectorReport<boolean, HTMLButtonElement>('button[data-testid="shuffleButton"]', (el) => el.className.includes('Active'), false, 'shuffle')
  },
  events: {
    // TODO: all of these
    togglePlaying: () => {
      const button = document.querySelector('button[data-testid="pauseButton"], button[data-testid="resumeButton"]')
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
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLVideoElement>('video', (el) => el.currentTime = positionInSeconds, 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>('video', (el) => {
        el.volume = volume / 100
        if (volume === 0) el.muted = true
        else el.muted = false
      }, 'setVolume')
    },
    toggleRepeat: () => {
      const button = document.querySelector('button[data-testid="repeatButton"], button[data-testid="repeatOneButton"]')
      if (!button) return
      button.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      button.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
    },
    toggleShuffle: () => {
      const button = document.querySelector('button[data-testid="shuffleButton"]')
      if (!button) return
      button.dispatchEvent(new MouseEvent('mousedown', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
      button.dispatchEvent(new MouseEvent('mouseup', { view: window, bubbles: true, cancelable: true, clientX: 0, clientY: 0 }))
    },
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site