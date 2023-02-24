import { RepeatMode, Site, StateMode } from '../content'
import { getMediaSessionCover } from '../utils'

const site: Site = {
  ready: () => navigator.mediaSession.metadata !== null,
  info: {
    player: () => 'Spotify',
    // Supports mediaSession.metadata, but not mediaSession.playbackState
    state: () => (document.querySelectorAll('.player-controls__buttons button')[2].getAttribute('aria-label') === 'Pause' ? StateMode.PAUSED : StateMode.PLAYING),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    cover: () => getMediaSessionCover(),
    duration: () => document.querySelectorAll<HTMLElement>('.playback-bar > div')[2]?.innerText || '',
    position: () => document.querySelector<HTMLElement>('.playback-bar > div')?.innerText || '',
    volume: () => parseFloat(document.querySelector<HTMLElement>('.volume-bar__slider-container > div > div')?.style.getPropertyValue('--progress-bar-transform').replace('%', '') || '100'),
    rating: () => (document.querySelectorAll('.Root__now-playing-bar button')[1].getAttribute('aria-checked') === 'true' ? 5 : 0),
    repeat: () => {
      const state = document.querySelectorAll('.player-controls__buttons button')[4].getAttribute('aria-checked')
      if (state === 'true') return RepeatMode.ALL
      if (state === 'mixed') return RepeatMode.ONE
      return RepeatMode.NONE
    },
    shuffle: () => (document.querySelector('.player-controls__buttons button')?.getAttribute('aria-checked') === 'true')
  },
  events: {
    togglePlaying: () => document.querySelectorAll<HTMLButtonElement>('.player-controls__buttons button')[2]?.click(),
    next: () => document.querySelectorAll<HTMLButtonElement>('.player-controls__buttons button')[3]?.click(),
    previous: () => document.querySelectorAll<HTMLButtonElement>('.player-controls__buttons button')[1]?.click(),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      const el = document.querySelector('.playback-bar > div > div')
      if (!el) return
      const loc = el.getBoundingClientRect()
      const position = positionPercentage * loc.width

      el.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: loc.left + position,
        clientY: loc.top + (loc.height / 2)
      }))
      el.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: loc.left + position,
        clientY: loc.top + (loc.height / 2)
      }))
    },
    setVolume: (volume: number) => {
      const el = document.querySelector('.volume-bar > div > div > div')
      if (!el) return
      const loc = el.getBoundingClientRect()
      const vol = (volume / 100) * loc.width

      el.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: loc.left + vol,
        clientY: loc.top + (loc.height / 2)
      }))
      el.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: loc.left + vol,
        clientY: loc.top + (loc.height / 2)
      }))
    },
    toggleRepeat: () => document.querySelectorAll<HTMLButtonElement>('.player-controls__buttons button')[4]?.click(),
    toggleShuffle: () => document.querySelector<HTMLButtonElement>('.player-controls__buttons button')?.click(),
    toggleThumbsUp: () => document.querySelectorAll<HTMLButtonElement>('.Root__now-playing-bar button')[1]?.click(),
    toggleThumbsDown: null,
    setRating: (rating: number) => {
      if (rating >= 3 && site.info.rating?.() !== 5)
        site.events.toggleThumbsUp?.()
      else if (rating < 3 && site.info.rating?.() === 5)
        site.events.toggleThumbsUp?.()
    }
  }
}

export default site