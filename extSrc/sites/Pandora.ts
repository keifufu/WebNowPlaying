import { RepeatMode, Site, StateMode } from '../content'
import { capitalize } from '../utils'

const site: Site = {
  ready: () => document.querySelector('.Tuner__Audio__TrackDetail__title') !== null,
  info: {
    player: () => 'Pandora',
    state: () => {
      // If pandora asked if you are still listening it is paused
      if (document.querySelector('.StillListeningBody') !== null) return StateMode.STOPPED
      return document.querySelector('.PlayButton__Icon path')?.getAttribute('d')?.includes('22.5v-21l16.5') ? StateMode.PAUSED : StateMode.PLAYING
    },
    title: () => document.querySelector<HTMLElement>('.Tuner__Audio__TrackDetail__title')?.innerText || '',
    artist: () => document.querySelector<HTMLElement>('.Tuner__Audio__TrackDetail__artist')?.innerText || '',
    album: () => {
      const albumName = document.querySelector<HTMLElement>('.nowPlayingTopInfo__current__albumName')
      if (albumName) return albumName.innerText

      const albumURL = document.querySelector<HTMLAnchorElement>('.Tuner__Audio__TrackDetail__title')?.href.replace('://www.pandora.com/artist/', '')
      if (albumURL) return capitalize(albumURL.split('/')[1].replaceAll('-', ' '))

      return ''
    },
    cover: () => {
      let src = document.querySelector<HTMLImageElement>('.ImageLoader img')?.src
      const fullscreenImage = document.querySelector<HTMLImageElement>('.nowPlayingTopInfo__artContainer img')
      // eslint-disable-next-line prefer-destructuring
      if (fullscreenImage) src = fullscreenImage.src
      if (!src) return ''
      return `${src.split('/').slice(0, -1).join('/')}/500W_500H.jpg`
    },
    duration: () => document.querySelectorAll<HTMLElement>('.VolumeDurationControl__Duration span')[2]?.innerText || '0:00',
    position: () => document.querySelectorAll<HTMLElement>('.VolumeDurationControl__Duration span')[0]?.innerText || '0:00',
    volume: () => 100, // TODO: volume
    rating: () => {
      const thumbsUp = document.querySelector<HTMLButtonElement>('.ThumbUpButton')
      if (thumbsUp?.getAttribute('aria-checked') === 'true') return 5
      const thumbsDown = document.querySelector<HTMLButtonElement>('.ThumbDownButton')
      if (thumbsDown?.getAttribute('aria-checked') === 'true') return 1
      return 0
    },
    repeat: () => {
      const state = document.querySelector('.RepeatButton')?.getAttribute('aria-checked')
      if (state === 'true') return RepeatMode.ALL
      if (state === 'mixed') return RepeatMode.ONE
      return RepeatMode.NONE
    },
    shuffle: () => (document.querySelector('.ShuffleButton')?.getAttribute('aria-checked') === 'true')
  },
  events: {
    togglePlaying: () => document.querySelector<HTMLButtonElement>('.PlayButton')?.click(),
    next: () => {
      const normalSkipButton = document.querySelector<HTMLButtonElement>('.Tuner__Control__SkipForward__Button')
      if (normalSkipButton) return normalSkipButton.click()
      document.querySelector<HTMLButtonElement>('.SkipButton')?.click()
    },
    previous: () => {
      const normalSkipButton = document.querySelector<HTMLButtonElement>('.Tuner__Control__SkipBack__Button')
      if (normalSkipButton) return normalSkipButton.click()
      document.querySelector<HTMLButtonElement>('.ReplayButton')?.click()
    },
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      const el = document.querySelector('.TunerProgress__HitBox')
      if (!el) return
      const loc = el.getBoundingClientRect()
      const position = positionPercentage * loc.width

      el.dispatchEvent(new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: loc.left + position,
        clientY: loc.top + (loc.height / 2)
      }))
      el.dispatchEvent(new MouseEvent('mouseup', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: loc.left + position,
        clientY: loc.top + (loc.height / 2)
      }))
    },
    setVolume: null, // TODO: setVolume
    toggleRepeat: () => document.querySelector<HTMLButtonElement>('.RepeatButton')?.click(),
    toggleShuffle: () => document.querySelector<HTMLButtonElement>('.ShuffleButton')?.click(),
    toggleThumbsUp: () => document.querySelector<HTMLButtonElement>('.ThumbUpButton')?.click(),
    toggleThumbsDown: () => document.querySelector<HTMLButtonElement>('.ThumbDownButton')?.click(),
    setRating: (rating: number) => {
      if (rating >= 3 && site.info.rating?.() !== 5)
        site.events.toggleThumbsUp?.()
      else if (rating < 3 && site.info.rating?.() !== 1)
        site.events.toggleThumbsDown?.()
    }
  }
}

export default site