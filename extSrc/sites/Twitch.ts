import { RepeatMode, Site, StateMode } from '../content'
import { timeInSecondsToString } from '../utils'

const site: Site = {
  ready: () => document.querySelector('.video-player__default-player') !== null && document.querySelector('video') !== null,
  info: {
    player: () => 'Twitch',
    state: () => (document.querySelector('video')?.paused ? StateMode.PAUSED : StateMode.PLAYING),
    title: () => document.querySelector<HTMLElement>('h2[data-a-target="stream-title"]')?.innerText || '',
    artist: () => document.querySelector<HTMLElement>('h1.tw-title')?.innerText || '',
    album: () => document.querySelector<HTMLElement>('a[data-a-target="stream-game-link"] > span')?.innerText || '',
    cover: () => document.querySelector<HTMLImageElement>(`img[alt="${document.location.href.split('/').pop()}" i]`)?.src.replace('70x70', '600x600') || '',
    duration: () => {
      // If the duration is 1073741824, it's a live stream
      if (document.querySelector('video')?.duration === 1073741824) {
        const duration_read = document.querySelector<HTMLElement>('span.live-time')?.innerText.split(':')
        if (!duration_read) return '0:00'
        duration_read.reverse()
        let duration = 0
        for (let i = duration_read.length - 1; i >= 0; i--)
          duration += Number(duration_read[i]) * (60 ** i)
        return timeInSecondsToString(duration)
      }
      return timeInSecondsToString(document.querySelector('video')?.duration || 0)
    },
    position: () => {
      if (document.querySelector('video')?.duration === 1073741824) {
        const duration_read = document.querySelector<HTMLElement>('span.live-time')?.innerText.split(':')
        if (!duration_read) return '0:00'
        duration_read.reverse()
        let duration = 0
        for (let i = duration_read.length - 1; i >= 0; i--)
          duration += Number(duration_read[i]) * (60 ** i)
        return timeInSecondsToString(duration)
      } else {
        return timeInSecondsToString(document.querySelector('video')?.currentTime || 0)
      }
    },
    volume: () => (document.querySelector('video')?.volume || 0) * 100,
    // Rating could be following, but ffz and/or bttv fuck it up so I can't get it consistently
    rating: () => 0,
    repeat: () => RepeatMode.NONE,
    shuffle: () => false
  },
  events: {
    togglePlaying: () => (site.info.state() === StateMode.PAUSED ? document.querySelector('video')?.play() : document.querySelector('video')?.pause()),
    next: () => {
      // If we are not live
      const video = document.querySelector('video')
      if (video && video.duration !== 1073741824)
        video.currentTime = video.duration
    },
    previous: () => {
      // If we are not live
      const video = document.querySelector('video')
      if (video && video.duration !== 1073741824)
        video.currentTime = 0
    },
    setPositionSeconds: (positionInSeconds: number) => {
      // If we are not live
      const video = document.querySelector('video')
      if (video && video.duration !== 1073741824)
        video.currentTime = positionInSeconds
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      const video = document.querySelector('video')
      if (video) video.volume = volume / 100
    },
    toggleRepeat: null,
    toggleShuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site