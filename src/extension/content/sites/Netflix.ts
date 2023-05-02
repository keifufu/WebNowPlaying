import { DEFAULT_UPDATE_FREQUENCY } from '../../../utils/settings'
import { NetflixInfo, RatingSystem, RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ContentUtils } from '../utils'

let currentNetflixInfo: NetflixInfo | null = null

const site: Site = {
  match: () => window.location.hostname === 'www.netflix.com',
  init() {
    setInterval(async () => {
      const netflixInfo = await ContentUtils.getNetflixInfo()
      if (netflixInfo) currentNetflixInfo = netflixInfo
    }, DEFAULT_UPDATE_FREQUENCY / 2)
  },
  ready: () => (currentNetflixInfo?.isPlayerReady ?? false) && querySelector<boolean, HTMLVideoElement>('video', (el) => true, false) && querySelector<boolean, HTMLVideoElement>('video', (el) => el.duration > 0, false),
  ratingSystem: RatingSystem.NONE,
  info: {
    playerName: () => 'Netflix',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state'),
    title: () => {
      const data = currentNetflixInfo?.seasonData
      if (data) {
        if (data.type === 'show' && data.episode.title) {
          let { title } = data.episode
          if (data.season && [...data.season.episodes].length > 1 && data.season.shortName)
            title += ` (${data.season.shortName}E${data.episode.seq})`

          return String(title)
        }
        return String(data.title)
      }
      return ''
    },
    artist: () => {
      const data = currentNetflixInfo?.seasonData
      if (data && data.type === 'show' && data.episode.title)
        return String(data.title)
      return 'Netflix'
    },
    album: () => {
      const data = currentNetflixInfo?.seasonData
      if (data && data.type === 'show' && data.episode.title && data.season.longName)
        return String(data.season.longName)
      return 'Netflix'
    },
    coverUrl: () => {
      if (currentNetflixInfo?.metadata._metadata.video) {
        const { artwork, boxart, storyart } = currentNetflixInfo?.metadata._metadata.video
        let art
        if (artwork.length > 0) art = artwork
        else if (storyart.length > 0) art = storyart
        else art = boxart
        art = [...art].reduce((prev, cur) => (prev.w * prev.h > cur.w * cur.h ? prev : cur))
        return String(art.url) || ''
      }
      return ''
    },
    durationSeconds: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => el.duration, 0, 'durationSeconds'),
    positionSeconds: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => el.currentTime, 0, 'positionSeconds'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => 0,
    repeatMode: () => RepeatMode.NONE,
    shuffleActive: () => false
  },
  events: {
    setState: (state) => querySelectorEventReport<HTMLVideoElement>('video', (el) => (state === StateMode.PLAYING ? el.play() : el.pause()), 'setState'),
    skipPrevious: () => {
      const data = currentNetflixInfo?.navData
      if (data?.prevId && data?.currId) {
        window.location.href = window.location.href.replace(
          data.currId,
          data.prevId
        )
      }
    },
    skipNext: () => {
      const data = currentNetflixInfo?.navData
      if (data?.nextId && data?.currId) {
        window.location.href = window.location.href.replace(
          data.currId,
          data.nextId
        )
      }
    },
    setPositionSeconds: (timeInSeconds) => ContentUtils.seekNetflix(timeInSeconds),
    setPositionPercentage: null,
    setVolume: (volume: number) => querySelectorEventReport<HTMLVideoElement>('video', (el) => {
      el.muted = false
      el.volume = volume / 100
    }, 'setVolume'),
    toggleRepeatMode: null,
    toggleShuffleActive: null,
    setRating: null
  }
}

export default site