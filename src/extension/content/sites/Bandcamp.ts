import { capitalize } from '../../../utils/misc'
import { RatingSystem, RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'

const site: Site = {
  match: () => window.location.hostname.endsWith('bandcamp.com') || document.querySelector('[content="@bandcamp"]') !== null,
  ready: () => querySelector<boolean, HTMLAudioElement>('audio', (el) => !!el.src, false),
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => 'Bandcamp',
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
    artist: () => querySelectorReport<string, HTMLElement>('.artist span, .albumTitle span', (el) => el.innerText, capitalize(window.location.host.split('.')[0]), 'artist'),
    album: () => {
      // Note: I was going to use the queue-icon to indicate whether we are listening to a album, but it seems it's always there once it's loaded
      // So instead we only return the album if it's not equal to the title
      const album = querySelector<string, HTMLElement>('.title', (el) => el.innerText, '')
      if (album.length > 0 && album !== site.info.title()) return album

      // If .title is set, we are listening to an album
      const albumTitle = querySelector<string, HTMLElement>('.title', (el) => el.innerText, '')
      if (albumTitle.length > 0) return querySelector<string, HTMLElement>('.trackTitle', (el) => el.innerText, '')
      return ''
    },
    coverUrl: () => querySelectorReport<string, HTMLImageElement>('.carousel-player-inner img, .popupImage img', (el) => el.src, '', 'coverUrl'),
    durationSeconds: () => querySelectorReport<number, HTMLAudioElement>('audio', (el) => el.duration, 0, 'durationSeconds'),
    positionSeconds: () => querySelectorReport<number, HTMLAudioElement>('audio', (el) => el.currentTime, 0, 'positionSeconds'),
    volume: () => querySelectorReport<number, HTMLAudioElement>('audio', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => 0,
    repeatMode: () => RepeatMode.NONE,
    shuffleActive: () => false
  },
  events: {
    setState: (state) => {
      if (site.info.state() === state) return
      querySelectorEventReport<HTMLButtonElement>('.playpause, .playbutton', (el) => el.click(), 'setState')
    },
    skipPrevious: () => querySelectorEventReport<HTMLButtonElement>('.prevbutton, .prev div', (el) => el.click(), 'skipPrevious'),
    skipNext: () => querySelectorEventReport<HTMLButtonElement>('.nextbutton, .next div', (el) => el.click(), 'skipNext'),
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLAudioElement>('audio', (el) => el.currentTime = positionInSeconds, 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLAudioElement>('audio', (el) => {
        el.volume = volume / 100
        if (volume === 0) el.muted = true
        else el.muted = false
      }, 'setVolume')
    },
    toggleRepeatMode: null,
    toggleShuffleActive: null,
    setRating: null
  }
}

export default site