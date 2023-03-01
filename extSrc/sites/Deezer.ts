import { RepeatMode, Site, StateMode } from '../content'
import { getMediaSessionCover } from '../utils'

const site: Site = {
  ready: () => navigator.mediaSession.metadata !== null && document.querySelector('.track-link') !== null,
  info: {
    player: () => 'Deezer',
    state: () => (document.querySelectorAll('.player-controls svg')[1].getAttribute('data-testid') === 'PauseIcon' ? StateMode.PLAYING : StateMode.PAUSED),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    cover: () => getMediaSessionCover(),
    duration: () => document.querySelector<HTMLElement>('.slider-counter-max')?.innerText || '0:00',
    position: () => document.querySelector<HTMLElement>('.slider-counter-current')?.innerText || '0:00',
    volume: () => 100, // TODO: Not supported for now
    rating: () => (document.querySelectorAll('.track-actions svg')[2].getAttribute('data-testid') === 'HeartIcon' ? 0 : 5),
    repeat: () => {
      const svg = document.querySelectorAll('.option-item svg')[1]
      if (!svg) return RepeatMode.NONE
      const isActive = getComputedStyle(svg).color === 'rgb(239, 84, 102)'
      if (svg.getAttribute('data-testid') === 'RepeatIcon' && isActive) return RepeatMode.ALL
      if (svg.getAttribute('data-testid') === 'RepeatOneIcon') return RepeatMode.ONE
      return RepeatMode.NONE
    },
    shuffle: () => {
      const svg = document.querySelectorAll('.option-item svg')[2]
      if (!svg) return false
      const isActive = getComputedStyle(svg).color === 'rgb(239, 84, 102)'
      return isActive
    }
  },
  events: {
    togglePlaying: () => document.querySelectorAll<HTMLButtonElement>('.player-controls button')[1]?.click(),
    next: () => () => document.querySelectorAll<HTMLButtonElement>('.player-controls button')[2]?.click(),
    previous: () => () => document.querySelectorAll<HTMLButtonElement>('.player-controls button')[0]?.click(),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      const el = document.querySelector<HTMLInputElement>('.slider-track-input')
      if (!el) return
      const loc = el.getBoundingClientRect()
      const position = positionPercentage * loc.width

      el.value = (positionPercentage * parseFloat(el.getAttribute('aria-valuemax') || '0')).toString()
      el.dispatchEvent(new MouseEvent('mouseup', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: loc.left + position,
        clientY: loc.top + (loc.height / 2)
      }))
    },
    setVolume: null, // TODO: Not supported for now
    toggleRepeat: () => document.querySelectorAll<HTMLButtonElement>('.option-item button')[1]?.click(),
    toggleShuffle: () => document.querySelectorAll<HTMLButtonElement>('.option-item button')[2]?.click(),
    toggleThumbsUp: () => document.querySelectorAll<HTMLButtonElement>('.track-actions button')[2]?.click(),
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