import { RepeatMode, Site, StateMode } from '../content'
import { querySelector, querySelectorEventReport, querySelectorReport, timeInSecondsToString } from '../utils'

let shuffleState = false
let playlistLoaded = false

const site: Site = {
  ready: () => {
    // TODO:
    const title = document.querySelector<HTMLElement>('.ytp-title-text')
    return title !== null && title.innerText?.length > 0 && !document.querySelector('.html5-video-player')?.classList.contains('unstarted-mode')
  },
  info: {
    player: () => 'Youtube Embed',
    state: () => {
      let state = querySelectorReport<StateMode, HTMLVideoElement>('.html5-main-video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state')
      // It is possible for the video to be "playing" but not started
      if (state === StateMode.PLAYING && querySelector<boolean, HTMLVideoElement>('.html5-main-video', (el) => el.played.length <= 0, false))
        state = StateMode.PAUSED
      return state
    },
    title: () => querySelectorReport<string, HTMLElement>('.ytp-title-text', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLElement>('.ytp-title-expanded-title', (el) => el.innerText, '', 'artist'),
    album: () => querySelector<string, HTMLElement>('.ytp-playlist-menu-title', (el) => el.innerText, ''),
    cover: () => {
      const videoId = new URLSearchParams(document.querySelector<HTMLAnchorElement>('.ytp-title-link')?.search).get('v')
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    },
    duration: () => querySelectorReport<string, HTMLVideoElement>('.html5-main-video', (el) => timeInSecondsToString(el.duration), '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLVideoElement>('.html5-main-video', (el) => timeInSecondsToString(el.currentTime), '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('.html5-main-video', (el) => (el.muted ? 0 : el.volume * 100), 0, 'volume'),
    rating: () => 0,
    repeat: () => RepeatMode.NONE,
    shuffle: () => shuffleState
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('.ytp-play-button', (el) => el.click(), 'togglePlaying'),
    next: () => {
      // Not using reporting querySelectors right now
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
      // Not using reporting querySelectors right now
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
    setPositionSeconds: (positionInSeconds: number) => querySelectorEventReport<HTMLVideoElement>('.html5-main-video', (el) => el.currentTime = positionInSeconds, 'setPositionSeconds'),
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>('.html5-main-video', (el) => {
        el.volume = volume / 100
        if (volume === 0) el.muted = true
        else el.muted = false
      }, 'setVolume')
    },
    toggleRepeat: () => querySelectorEventReport<HTMLVideoElement>('.html5-main-video', (el) => el.loop = !el.loop, 'toggleRepeat'),
    toggleShuffle: () => {
      // Not using reporting querySelectors right now
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