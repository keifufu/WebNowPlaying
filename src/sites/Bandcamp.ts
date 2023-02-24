import { Site } from '../content'
import { capitalize, timeInSecondsToString } from '../utils'

const site: Site = {
  ready: () => document.querySelector('audio') !== null,
  info: {
    player: () => 'Bandcamp',
    state: () => (document.querySelector('audio')?.paused ? 2 : 1),
    title: () => document.querySelector<HTMLElement>('.trackTitle')?.innerText || document.querySelector<HTMLElement>('.title')?.innerText || '',
    artist: () => document.querySelector<HTMLElement>('.artist span')?.innerText || capitalize(document.location.host.split('.')[0]),
    album: () => document.querySelector<HTMLElement>('.fromAlbum')?.innerText || '',
    cover: () => document.querySelector<HTMLImageElement>('.carousel-player-inner img')?.src || document.querySelector<HTMLImageElement>('.popupImage img')?.src || '',
    duration: () => timeInSecondsToString(document.querySelector('audio')?.duration || 0),
    position: () => timeInSecondsToString(document.querySelector('audio')?.currentTime || 0),
    volume: () => (document.querySelector('audio')?.volume || 1) * 100,
    rating: () => 0,
    repeat: () => 0,
    shuffle: () => 0
  },
  events: {
    playpause: () => {
      const button = document.querySelector<HTMLButtonElement>('.playpause') || document.querySelector<HTMLButtonElement>('.playbutton')
      button?.click()
    },
    next: () => {
      const button = document.querySelector<HTMLButtonElement>('.nextbutton') || document.querySelector<HTMLButtonElement>('.next')
      button?.click()
    },
    previous: () => {
      const button = document.querySelector<HTMLButtonElement>('.prevbutton') || document.querySelector<HTMLButtonElement>('.prev')
      button?.click()
    },
    setPositionSeconds: (positionInSeconds: number) => {
      const audio = document.querySelector('audio')
      if (audio) audio.currentTime = positionInSeconds
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      const audio = document.querySelector('audio')
      if (audio) {
        audio.volume = volume
        if (volume === 0) audio.muted = true
        else audio.muted = false
      }
    },
    repeat: null,
    shuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    rating: null
  }
}

export default site