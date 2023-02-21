import { Site } from '../content'
import { timeInSecondsToString } from '../utils'

let shuffleState = 0
let playlistLoaded = false

const site: Site = {
  ready: () => {
    const title = document.querySelector<HTMLElement>('.ytp-title-text')
    return title !== null && title.innerText?.length > 0 && !document.querySelector('.html5-video-player')?.classList.contains('unstarted-mode')
  },
  info: {
    player: () => 'Youtube Embed',
    state: () => {
      let state = document.querySelector<HTMLVideoElement>('.html5-main-video')?.paused ? 2 : 1
      // I copied this from the original, documentation says 3 isn't used, but apparently it is?
      if (document.querySelector('.ytp-play-button')?.getAttribute('aria-label') === null)
        state = 3
      // It is possible for the video to be "playing" but not started
      if (state === 1 && (document.querySelector<HTMLVideoElement>('.html5-main-video')?.played.length || 0) <= 0)
        state = 2
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
      return video.volume
    },
    rating: () => 0,
    repeat: () => 0, // 0 = no repeat, 1 = repeat song, 2 = repeat playlist
    shuffle: () => shuffleState
  },
  events: {
    playpause: () => document.querySelector<HTMLButtonElement>('.ytp-play-button')?.click(),
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
        video.volume = volume
        if (volume === 0) video.muted = true
        else video.muted = false
      }
    },
    repeat: () => {
      const video = document.querySelector<HTMLVideoElement>('.html5-main-video')
      if (video) video.loop = !video.loop
    },
    shuffle: () => {
      const list = new URLSearchParams(document.querySelector<HTMLAnchorElement>('.ytp-title-link')?.search).get('list')
      if (list) shuffleState = Number(!shuffleState)
      else shuffleState = 0
    },
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    rating: null
  }
}

export default site