import { getMediaSessionCover } from '../../../utils/misc'
import { RatingSystem, RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEvent } from '../selectors'
import { ratingUtils } from '../utils'

const site: Site = {
  match: () => document.querySelector('[content="Jellyfin"]') !== null,
  ready: () => getPlayer() !== null,
  ratingSystem: RatingSystem.LIKE,
  info: {
    playerName: () => 'Jellyfin',
    state: () => queryPlayer((player) => (player.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.STOPPED),
    title: () => navigator.mediaSession.metadata?.title || querySelector<string, HTMLElement>('.pageTitle', (el) => el.innerText, ''),
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    coverUrl: () => {
      if (getPlayer()?.src?.includes('/Videos/')) {
        const itemId = getPlayer()?.src?.split('/Videos/')[1].split('/')[0].split('?')[0]
        if (itemId) return `${window.location.origin}/Items/${itemId}/Images/Primary`
      }

      const mediaSessionCover = getMediaSessionCover()
      if (mediaSessionCover) return mediaSessionCover

      // Not all videos have a poster, so there is still a chance no image is found
      const poster = getPlayer()?.getAttribute('poster')
      if (poster) {
        if (poster.startsWith('http')) return poster
        else return window.location.origin + poster
      }

      return ''
    },
    durationSeconds: () => queryPlayer((player) => player.duration, 0),
    positionSeconds: () => queryPlayer((player) => player.currentTime, 0),
    volume: () => queryPlayer((player) => {
      if (player.muted) return 0
      return Math.round((player.volume ** (1 / 3)) * 100)
    }, 100),
    rating: () => querySelector<number, HTMLButtonElement>('.nowPlayingBarUserDataButtons > button[data-isfavorite]', (el) => (el.getAttribute('data-isfavorite') === 'true' ? 5 : 0), 0),
    repeatMode: () => {
      const button = document.querySelector('.toggleRepeatButton')
      const span = button?.querySelector('span')
      if (!span) return RepeatMode.NONE
      if (span.classList.contains('repeat_one')) return RepeatMode.ONE
      if (button?.classList.contains('buttonActive')) return RepeatMode.ALL
      return RepeatMode.NONE
    },
    shuffleActive: () => querySelector<boolean, HTMLButtonElement>('.btnShuffleQueue', (el) => el.classList.contains('buttonActive'), false)
  },
  events: {
    setState: (state) => {
      if (site.info.state() === state) return
      queryPlayerEvent((player) => (player.paused ? player.play() : player.pause()))
    },
    skipPrevious: () => querySelectorEvent<HTMLButtonElement>('.btnPreviousTrack', (el) => el.click()),
    skipNext: () => querySelectorEvent<HTMLButtonElement>('.btnNextTrack', (el) => el.click()),
    setPositionSeconds: (seconds) => queryPlayerEvent((player) => player.currentTime = seconds),
    setPositionPercentage: null,
    setVolume: (volume) => queryPlayerEvent((player) => {
      player.muted = false
      player.volume = (volume / 100) ** 3
    }),
    toggleRepeatMode: () => querySelectorEvent<HTMLButtonElement>('.toggleRepeatButton', (el) => el.click()),
    toggleShuffleActive: () => querySelectorEvent<HTMLButtonElement>('.btnShuffleQueue', (el) => el.click()),
    setRating: (rating) => {
      ratingUtils.like(rating, site, {
        toggleLike: () => {
          querySelectorEvent<HTMLButtonElement>('.nowPlayingBarUserDataButtons > button[data-isfavorite]', (el) => el.click())
        }
      })
    }
  }
}

const getPlayer = (): HTMLVideoElement | HTMLAudioElement | null => document.querySelector<HTMLVideoElement>('video') || document.querySelector<HTMLAudioElement>('audio[src]')
const queryPlayer = <T>(exec: (el: HTMLVideoElement | HTMLAudioElement) => T | null, defaultValue: T): T => {
  const player = getPlayer()
  if (!player) return defaultValue
  const result = exec(player)
  if (!result && result !== 0 && result !== false) return defaultValue
  return result
}
const queryPlayerEvent = (action: (el: HTMLVideoElement | HTMLAudioElement) => any): boolean => {
  const player = getPlayer()
  if (!player) return false
  action(player)
  return true
}


export default site