import { RepeatMode, Site, StateMode } from '../content'
import { capitalize, querySelector, querySelectorEventReport, querySelectorReport } from '../utils'

const site: Site = {
  ready: () => querySelector<boolean, HTMLElement>('.Tuner__Audio__TrackDetail__title', (el) => el !== null, false),
  info: {
    player: () => 'Pandora',
    state: () => {
      // If pandora asked if you are still listening it is paused
      if (document.querySelector('.StillListeningBody') !== null) return StateMode.STOPPED
      return querySelectorReport<StateMode, HTMLElement>('.PlayButton__Icon path', (el) => (el.getAttribute('d')?.includes('22.5v-21l16.5') ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state')
    },
    title: () => querySelectorReport<string, HTMLElement>('.Tuner__Audio__TrackDetail__title', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLElement>('.Tuner__Audio__TrackDetail__artist', (el) => el.innerText, '', 'artist'),
    album: () => {
      const albumName = document.querySelector<HTMLElement>('.nowPlayingTopInfo__current__albumName')
      if (albumName) return albumName.innerText
      const albumURL = document.querySelector<HTMLAnchorElement>('.Tuner__Audio__TrackDetail__title')?.href.replace('://www.pandora.com/artist/', '')
      if (albumURL) return capitalize(albumURL.split('/')[1].replaceAll('-', ' '))
      return ''
    },
    cover: () => querySelectorReport<string, HTMLImageElement>('.ImageLoader img, .nowPlayingTopInfo__artContainer img', (el) => `${el.src.split('/').slice(0, -1).join('/')}/500W_500H.jpg`, '', 'cover'),
    duration: () => querySelectorReport<string, HTMLElement>('(.VolumeDurationControl__Duration span)[2]', (el) => el.innerText, '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLElement>('.VolumeDurationControl__Duration span', (el) => el.innerText, '0:00', 'position'),
    volume: () => 100,
    rating: () => {
      const thumbsUp = querySelectorReport<boolean, HTMLButtonElement>('.ThumbUpButton', (el) => el.getAttribute('aria-checked') === 'true', false, 'rating')
      if (thumbsUp) return 5
      const thumbsDown = querySelectorReport<boolean, HTMLButtonElement>('.ThumbDownButton', (el) => el.getAttribute('aria-checked') === 'true', false, 'rating')
      if (thumbsDown) return 1
      return 0
    },
    repeat: () => querySelectorReport<RepeatMode, HTMLButtonElement>('.RepeatButton', (el) => {
      const state = el.getAttribute('aria-checked')
      if (state === 'true') return RepeatMode.ALL
      if (state === 'mixed') return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeat'),
    shuffle: () => querySelectorReport<boolean, HTMLButtonElement>('.ShuffleButton', (el) => el.getAttribute('aria-checked') === 'true', false, 'shuffle')
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('.PlayButton', (el) => el.click(), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('.SkipButton, .Tuner__Control__SkipForward__Button', (el) => el.click(), 'next'),
    previous: () => querySelectorEventReport<HTMLButtonElement>('.ReplayButton, .Tuner__Control__SkipBack__Button', (el) => el.click(), 'previous'),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLElement>('.TunerProgress__HitBox', (el) => {
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
      }, 'setPositionPercentage')
    },
    setVolume: null,
    toggleRepeat: () => querySelectorEventReport<HTMLButtonElement>('.RepeatButton', (el) => el.click(), 'toggleRepeat'),
    toggleShuffle: () => querySelectorEventReport<HTMLButtonElement>('.ShuffleButton', (el) => el.click(), 'toggleShuffle'),
    toggleThumbsUp: () => querySelectorEventReport<HTMLButtonElement>('.ThumbUpButton', (el) => el.click(), 'toggleThumbsUp'),
    toggleThumbsDown: () => querySelectorEventReport<HTMLButtonElement>('.ThumbDownButton', (el) => el.click(), 'toggleThumbsDown'),
    setRating: (rating: number) => {
      if (rating >= 3 && site.info.rating?.() !== 5)
        site.events.toggleThumbsUp?.()
      else if (rating < 3 && site.info.rating?.() !== 1)
        site.events.toggleThumbsDown?.()
    }
  }
}

export default site