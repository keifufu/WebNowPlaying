import { RepeatMode, Site, StateMode } from '../content'
import { capitalize, querySelector, querySelectorEventReport, querySelectorReport, timeInSecondsToString } from '../utils'

const site: Site = {
  ready: () => querySelector<boolean, HTMLAudioElement>('audio', (el) => el !== null, false),
  info: {
    player: () => 'Bandcamp',
    state: () => querySelectorReport<StateMode, HTMLAudioElement>('audio', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state'),
    title: () => {
      // TItle of the current song when playing in collections page
      const collectionTitle = querySelector<string, HTMLElement>('[data-bind="text: currentTrack().trackTitle"]', (el) => el.innerText, '')
      if (collectionTitle.length > 0) return collectionTitle
      // Title of the current song when playing an album
      const albumTitle = querySelector<string, HTMLElement>('.title', (el) => el.innerText, '')
      if (albumTitle.length > 0) return albumTitle
      return querySelector<string, HTMLElement>('.trackTitle', (el) => el.innerText, '')
    },
    artist: () => querySelectorReport<string, HTMLElement>('.artist span', (el) => el.innerText, capitalize(document.location.host.split('.')[0]), 'artist'),
    album: () => {
      // If .queue-icon is a element, we are listening to a album in a collection
      if (document.querySelector('.queue-icon') !== null) return querySelector<string, HTMLElement>('.title', (el) => el.innerText, '')
      // If .title is set, we are listening to an album
      const albumTitle = querySelector<string, HTMLElement>('.title', (el) => el.innerText, '')
      if (albumTitle.length > 0) return querySelector<string, HTMLElement>('.trackTitle', (el) => el.innerText, '')
      return ''
    },
    cover: () => querySelectorReport<string, HTMLImageElement>('.carousel-player-inner img, .popupImage img', (el) => el.src, '', 'cover'),
    duration: () => querySelectorReport<string, HTMLAudioElement>('audio', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLAudioElement>('audio', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLAudioElement>('audio', (el) => el.volume * 100, 100, 'volume'),
    rating: () => 0,
    repeat: () => RepeatMode.NONE,
    shuffle: () => false
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('.playpause, .playbutton', (el) => el.click(), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('.nextbutton, .next div', (el) => el.click(), 'next'),
    previous: () => querySelectorEventReport<HTMLButtonElement>('.prevbutton, .prev div', (el) => el.click(), 'previous'),
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLAudioElement>('audio', (el) => el.currentTime = positionInSeconds, 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLAudioElement>('audio', (el) => {
        el.volume = volume / 100
        if (volume === 0) el.muted = true
        else el.muted = false
      }, 'setVolume')
    },
    toggleRepeat: null,
    toggleShuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site