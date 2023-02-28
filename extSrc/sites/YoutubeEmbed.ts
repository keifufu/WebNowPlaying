import { RepeatMode, Site, StateMode } from '../content'
import { timeInSecondsToString } from '../utils'

let shuffleState = false
let playlistLoaded = false

const site: Site = {
  ready: () => {
    const title = document.querySelector<HTMLElement>('.ytp-title-text')
    return title !== null && title.innerText?.length > 0 && !document.querySelector('.html5-video-player')?.classList.contains('unstarted-mode')
  },
  info: {
    player: () => 'Youtube Embed',
    state: () => {
      let state = document.querySelector<HTMLVideoElement>('.html5-main-video')?.paused ? StateMode.PAUSED : StateMode.PLAYING
      // It is possible for the video to be "playing" but not started
      if (state === StateMode.PLAYING && (document.querySelector<HTMLVideoElement>('.html5-main-video')?.played.length || 0) <= 0)
        state = StateMode.PAUSED
      return state
    },
    title: () => document.querySelector<HTMLElement>('.ytp-title-text')?.innerText || '', // The title of the current song
    artist: () => document.querySelector<HTMLElement>('.ytp-title-expanded-title')?.innerText || '', // The artist of the current song
    album: () => {
      const playlist = document.querySelector<HTMLElement>('.ytp-playlist-menu-title')
      if (playlist && playlist.innerText.length > 0)
        return playlist.innerText
      return ''
    },
    cover: () => {
      const videoId = new URLSearchParams(document.querySelector<HTMLAnchorElement>('.ytp-title-link')?.search).get('v')
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    },
    duration: () => (
      document.querySelector<HTMLElement>('.ytp-time-duration')?.innerText ||
        timeInSecondsToString(document.querySelector<HTMLVideoElement>('.html5-main-video')?.duration || 0)
    ),
    position: () => timeInSecondsToString(document.querySelector<HTMLVideoElement>('.html5-main-video')?.currentTime || 0),
    volume: () => {
      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (!video || video.muted) return 0
      return (video.volume * 100)
    },
    rating: () => 0,
    repeat: () => RepeatMode.NONE,
    shuffle: () => shuffleState
  },
  events: {
    togglePlaying: () => document.querySelector<HTMLButtonElement>('.ytp-play-button')?.click(),
    next: () => {
      const list = new URLSearchParams(document.querySelector<HTMLAnchorElement>('.ytp-title-link')?.search).get('list')
      if (shuffleState && list) {
        const playlist = document.querySelector('.ytp-playlist-menu-items')
        // Open the playlist menu and close it again to load the children
        if (!playlistLoaded && playlist?.children.length === 0) {
          const openButton = document.querySelector<HTMLButtonElement>('.ytp-playlist-menu-button')
          openButton?.click()
          openButton?.click()
          playlistLoaded = true
        }
        (playlist?.children[
          Math.floor(Math.random() * playlist?.children.length)
        ] as HTMLButtonElement).click()
      } else {
        const nextButton = document.querySelector<HTMLButtonElement>('.ytp-next-button')
        if (nextButton?.getAttribute('aria-disabled') !== 'true') nextButton?.click()
      }
    },
    previous: () => {
      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (!video) return
      const previousButton = document.querySelector<HTMLButtonElement>('.ytp-prev-button')
      const list = new URLSearchParams(document.querySelector<HTMLAnchorElement>('.ytp-title-link')?.search).get('list')
      if (shuffleState && list) {
        if (video.currentTime <= 3) {
          const playlist = document.querySelector('.ytp-playlist-menu-items')
          // Open the playlist menu and close it again to load the children
          if (!playlistLoaded && playlist?.children.length === 0) {
            const openButton = document.querySelector<HTMLButtonElement>('.ytp-playlist-menu-button')
            openButton?.click()
            openButton?.click()
            playlistLoaded = true
          }
          (playlist?.children[
            Math.floor(Math.random() * playlist?.children.length)
          ] as HTMLButtonElement).click()
        } else {
          video.currentTime = 0
        }
      } else if (previousButton?.getAttribute('aria-disabled') !== 'true' && video.currentTime <= 3) {
        previousButton?.click()
      } else {
        video.currentTime = 0
      }
    },
    setPositionSeconds: (positionInSeconds: number) => {
      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (video) video.currentTime = positionInSeconds
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (video) {
        video.volume = volume / 100
        if (volume === 0) video.muted = true
        else video.muted = false
      }
    },
    toggleRepeat: () => {
      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (video) video.loop = !video.loop
    },
    toggleShuffle: () => {
      const list = new URLSearchParams(document.querySelector<HTMLAnchorElement>('.ytp-title-link')?.search).get('list')
      if (list) shuffleState = !shuffleState
      else shuffleState = false
    },
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site