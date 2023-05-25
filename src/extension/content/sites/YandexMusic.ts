import { convertTimeToSeconds, getMediaSessionCover } from '../../../utils/misc'
import { RatingSystem, RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ratingUtils } from '../utils'

const site: Site = {
  match: () => window.location.hostname === 'music.yandex.ru',
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLElement>('.player-controls__btn_play', (el) => true, false),
  ratingSystem: RatingSystem.LIKE,
  info: {
    playerName: () => 'Yandex Music', // The name of the player
    state: () => (querySelectorReport<StateMode, HTMLElement>('.player-controls__btn_play', (el) => (el.classList.contains('d-icon_play') ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state')),
    title: () => navigator.mediaSession.metadata?.title || '', // The title of the current song
    artist: () => navigator.mediaSession.metadata?.artist || '', // The artist of the current song
    album: () => navigator.mediaSession.metadata?.album || '', // The album of the current song
    coverUrl: () => getMediaSessionCover(), // A link to the cover image of the current song
    durationSeconds: () => querySelectorReport<number, HTMLElement>('.progress__bar .progress__right', (el) => convertTimeToSeconds(el.innerText), 0, 'durationSeconds'),
    positionSeconds: () => querySelectorReport<number, HTMLElement>('.progress__bar .progress__left', (el) => convertTimeToSeconds(el.innerText), 0, 'positionSeconds'),
    volume: () => querySelectorReport<number, HTMLElement>('.d-slider-vert__filled', (el) => parseFloat(el.style.getPropertyValue('height').replace('%', '')), 100, 'volume'),
    rating: () => 0, // The rating of the current song (1-5)
    repeatMode: () => querySelectorReport<RepeatMode, HTMLButtonElement>('.player-controls__btn_repeat', (el) => {
      const state = el.classList
      if (state.contains('player-controls__btn_repeat_state1')) return RepeatMode.ALL
      if (state.contains('player-controls__btn_repeat_state2')) return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeatMode'),
    shuffleActive: () => querySelectorReport<boolean, HTMLButtonElement>('.player-controls__btn_shuffle',
      (el) => el.classList.contains('player-controls__btn_on'),
      false,
      'shuffleActive')
  },
  events: {
    setState: (state) => querySelectorEventReport<HTMLButtonElement>('.player-controls__btn_play', (el) => (state === StateMode.PLAYING ? el.click() : el.click()), 'setState'),
    skipPrevious: () => querySelectorEventReport<HTMLButtonElement>('.d-icon_track-prev', (el) => el.click(), 'skipPrevious'),
    skipNext: () => querySelectorEventReport<HTMLButtonElement>('.d-icon_track-next', (el) => el.click(), 'skipNext'),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLElement>('.progress__progress', (el) => {
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
      }, 'setPositionPercentage')
    },
    setVolume: () => querySelectorEventReport<HTMLButtonElement>('.volume__icon', (el) => (el.click()), 'setVolume'), // Volume is on/off
    toggleRepeatMode: () => querySelectorEventReport<HTMLButtonElement>('.player-controls__btn_repeat', (el) => el.click(), 'toggleRepeatMode'),
    toggleShuffleActive: () => querySelectorEventReport<HTMLButtonElement>('.player-controls__btn_shuffle', (el) => el.click(), 'toggleShuffleActive'),
    setRating: (rating: number) => {
      ratingUtils.likeDislike(rating, site, {
        toggleLike: () => {
          querySelectorEventReport<HTMLButtonElement>('.d-like_theme-player', (el) => el.click(), 'setRating')
        },
        toggleDislike: () => {
          querySelectorEventReport<HTMLButtonElement>('.d-like_theme-player', (el) => el.click(), 'setRating')
        }
      })
    }
  }
}

export default site