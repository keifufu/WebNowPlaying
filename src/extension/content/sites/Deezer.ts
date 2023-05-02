import { convertTimeToSeconds, getMediaSessionCover } from '../../../utils/misc'
import { RatingSystem, RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEvent, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ratingUtils } from '../utils'

// Not reporting duration, position and rating as it seems they disappear once deezer annoys you with its ads

const site: Site = {
  match: () => window.location.hostname === 'www.deezer.com',
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLElement>('.track-link', (el) => true, false),
  ratingSystem: RatingSystem.LIKE,
  info: {
    playerName: () => 'Deezer',
    state: () => querySelectorReport<StateMode, HTMLElement>('(.player-controls svg)[1]', (el) => (el.getAttribute('data-testid') === 'PauseIcon' ? StateMode.PLAYING : StateMode.PAUSED), StateMode.PAUSED, 'state'),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    coverUrl: () => getMediaSessionCover(),
    durationSeconds: () => querySelector<number, HTMLElement>('.slider-counter-max', (el) => convertTimeToSeconds(el.innerText), 0),
    positionSeconds: () => querySelector<number, HTMLElement>('.slider-counter-current', (el) => convertTimeToSeconds(el.innerText), 0),
    volume: () => 100,
    rating: () => querySelector<number, HTMLElement>('(.track-actions svg)[2]', (el) => (el.getAttribute('data-testid') === 'HeartIcon' ? 0 : 5), 0),
    repeatMode: () => querySelectorReport<RepeatMode, HTMLElement>('(.option-item svg)[1]', (el) => {
      const isActive = getComputedStyle(el).color === 'rgb(239, 84, 102)'
      if (el.getAttribute('data-testid') === 'RepeatIcon' && isActive) return RepeatMode.ALL
      if (el.getAttribute('data-testid') === 'RepeatOneIcon') return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeatMode'),
    shuffleActive: () => querySelectorReport<boolean, HTMLElement>('(.option-item svg)[2]', (el) => getComputedStyle(el).color === 'rgb(239, 84, 102)', false, 'shuffleActive')
  },
  events: {
    setState: (state) => {
      if (site.info.state() === state) return
      querySelectorEventReport<HTMLButtonElement>('(.player-controls button)[1]', (el) => el.click(), 'setState')
    },
    skipPrevious: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls button)[0]', (el) => el.click(), 'skipPrevious'),
    skipNext: () => querySelectorEventReport<HTMLButtonElement>('(.player-controls button)[2]', (el) => el.click(), 'skipNext'),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLInputElement>('.slider-track-input', (el) => {
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
      }, 'setPositionPercentage')
    },
    setVolume: null,
    toggleRepeatMode: () => querySelectorEventReport<HTMLButtonElement>('(.option-item button)[1]', (el) => el.click(), 'toggleRepeatMode'),
    toggleShuffleActive: () => querySelectorEventReport<HTMLButtonElement>('(.option-item button)[2]', (el) => el.click(), 'toggleShuffleActive'),
    setRating: (rating: number) => {
      ratingUtils.like(rating, site, {
        toggleLike: () => {
          querySelectorEvent<HTMLButtonElement>('(.track-actions button)[2]', (el) => el.click())
        }
      })
    }
  }
}

export default site