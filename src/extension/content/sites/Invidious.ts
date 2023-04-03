import { timeInSecondsToString } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'

const site: Site = {
  ready: () => querySelector<boolean, HTMLVideoElement>('video', () => true, false),
  info: {
    player: () => 'Invidious',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.STOPPED, 'state'),
    // a[href*="watch"] is for embeds (/embed/)
    title: () => querySelectorReport<string, HTMLElement>('#contents > div > h1, a[href*="watch"]', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLElement>('#channel-name', (el) => el.innerText, '', 'artist'),
    album: () => querySelector<string, HTMLAnchorElement>('#playlist a', (el) => el.innerText, ''),
    cover: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => el.poster, '', 'cover'),
    duration: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => 0,
    repeat: () => querySelectorReport<RepeatMode, HTMLVideoElement>('video', (el) => (el.loop ? RepeatMode.ONE : RepeatMode.NONE), RepeatMode.NONE, 'repeat'),
    shuffle: () => false
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLVideoElement>('video', (el) => (el.paused ? el.play() : el.pause()), 'togglePlaying'),
    next: null,
    previous: null,
    setPositionSeconds: (seconds) => querySelectorEventReport<HTMLVideoElement>('video', (el) => (el.currentTime = seconds), 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume) => querySelectorEventReport<HTMLVideoElement>('video', (el) => {
      el.muted = false
      el.volume = volume / 100
    }, 'setVolume'),
    toggleRepeat: () => querySelectorEventReport<HTMLVideoElement>('video', (el) => (el.loop = !el.loop), 'toggleRepeat'),
    toggleShuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site