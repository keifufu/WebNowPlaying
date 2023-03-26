import { timeInSecondsToString } from '../../../utils/misc'
import { RepeatMode, Site, StateMode } from '../../types'
import { querySelector, querySelectorEventReport, querySelectorReport } from '../selectors'
import { ContentUtils } from '../utils'

let lastNetflixInfo: any = {}

const site: Site = {
  init() {
    setInterval(async () => {
      const netflixInfo = await ContentUtils.getNetflixInfo()
      if (netflixInfo) lastNetflixInfo = netflixInfo
    }, ContentUtils.getSettings().updateFrequencyMs2 / 2)
  },
  ready: () => lastNetflixInfo.isPlayerReady && querySelector<boolean, HTMLVideoElement>('video', (el) => true, false) && querySelector<boolean, HTMLVideoElement>('video', (el) => el.duration > 0, false),
  info: {
    player: () => 'Netflix',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state'),
    title: () => {
      const data = lastNetflixInfo.seasonData
      if (data) {
        if (data.type === 'show' && data.episode?.title) {
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
      const data = lastNetflixInfo.seasonData
      if (data && data.type === 'show' && data.episode?.title)
        return String(data.title)
      return 'Netflix'
    },
    album: () => {
      const data = lastNetflixInfo.seasonData
      if (data && data.type === 'show' && data.episode?.title && data.season.longName)
        return String(data.season.longName)
      return 'Netflix'
    },
    cover: () => {
      const { artwork, boxart, storyart } = lastNetflixInfo.metadata?._metadata?.video
      let art
      if (artwork?.length > 0) art = artwork
      else if (storyart?.length > 0) art = storyart
      else art = boxart
      art = [...art].reduce((prev, cur) => (prev.w * prev.h > cur.w * cur.h ? prev : cur))
      return String(art?.url) || ''
    },
    duration: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLVideoElement>('video', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => el.volume * 100, 100, 'volume'),
    rating: () => 0,
    repeat: () => RepeatMode.NONE,
    shuffle: () => false
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLVideoElement>('video', (el) => (el.paused ? el.play() : el.pause()), 'togglePlaying'),
    next: () => {
      const data = lastNetflixInfo.navData
      if (data?.nextId && data?.currId) {
        document.location.href = document.location.href.replace(
          data.currId,
          data.nextId
        )
      }
    },
    previous: () => {
      const data = lastNetflixInfo.navData
      if (data?.prevId && data?.currId) {
        document.location.href = document.location.href.replace(
          data.currId,
          data.prevId
        )
      }
    },
    setPositionSeconds: (timeInSeconds) => ContentUtils.seekNetflix(timeInSeconds),
    setPositionPercentage: null,
    setVolume: (volume: number) => querySelectorEventReport<HTMLVideoElement>('video', (el) => (el.volume = volume / 100), 'setVolume'),
    toggleRepeat: null,
    toggleShuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site