import { convertTimeToSeconds, getMediaSessionCover } from '../../../utils/misc'
import { RatingSystem, RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ratingUtils } from '../utils'

const site: Site = {
  match: () => window.location.hostname === 'music.yandex.ru',
  ready: () => navigator.mediaSession.metadata !== null && querySelector<boolean, HTMLElement>('.player-controls__btn_play', (el) => true, false),
  ratingSystem: RatingSystem.LIKE_DISLIKE,
  info: {
    playerName: () => 'Yandex Music',
    state: () => (querySelectorReport<StateMode, HTMLElement>('.player-controls__btn_play', (el) => (el.classList.contains('d-icon_play') ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state')),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    coverUrl: () => getMediaSessionCover(),
    durationSeconds: () => querySelectorReport<number, HTMLElement>('.progress__bar .progress__right', (el) => convertTimeToSeconds(el.innerText), 0, 'durationSeconds'),
    positionSeconds: () => querySelectorReport<number, HTMLElement>('.progress__bar .progress__left', (el) => convertTimeToSeconds(el.innerText), 0, 'positionSeconds'),
    volume: () => querySelectorReport<number, HTMLElement>('.volume__icon', (el) => ((el.classList.contains('volume__icon_mute')) ? 0 : 100), 100, 'volume'),
    rating: () => querySelectorReport<number, HTMLElement>('.player-controls__track-controls .d-icon_heart-full', (el) => (el === null ? 0 : 5), 0, 'rating'),
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
    setState: (state) => querySelectorEventReport<HTMLButtonElement>('.player-controls__btn_play', (el) => {
      el.click()
      if (state === StateMode.PLAYING) return StateMode.PAUSED
      return StateMode.PLAYING
    }, 'setState'),
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
    setVolume: (volume: number) => {
      const currVolume = site.info.volume()
      if ((currVolume === 0 && volume > 0) || (currVolume === 100 && volume < 100))
        querySelectorEventReport<HTMLButtonElement>('.volume__btn', (el) => el.click(), 'setVolume')
    },
    toggleRepeatMode: () => querySelectorEventReport<HTMLButtonElement>('.player-controls__btn_repeat', (el) => el.click(), 'toggleRepeatMode'),
    toggleShuffleActive: () => querySelectorEventReport<HTMLButtonElement>('.player-controls__btn_shuffle', (el) => el.click(), 'toggleShuffleActive'),
    setRating: (rating: number) => {
      ratingUtils.likeDislike(rating, site, {
        toggleLike: () => {
          querySelectorEventReport<HTMLButtonElement>('.player-controls__btn .d-icon_heart', (el) => el.click(), 'setRating')
        },
        toggleDislike: () => {
          querySelectorEventReport<HTMLButtonElement>('.player-controls__btn .d-icon_heart-full', (el) => el.click(), 'setRating')
        }
      })
    }
  }
}

export default site
