/* eslint-disable no-loop-func */
import { capitalize, getMediaSessionCover, timeInSecondsToString } from '../../utils/misc'
import { RepeatMode, Site, StateMode } from '../content'

let isInitialized = false
let element: HTMLMediaElement


const site: Site = {
  init: () => {
    if (isInitialized) return
    isInitialized = true
    console.log('Initializing Radio Addict site')
  },
  ready: () => {
    return (element !== undefined && element !== null && element.duration > 0) || navigator.mediaSession.metadata !== null
  },
  info: {
    player: () => capitalize(window.location.hostname.split('.').slice(-2).join('.')),
    state: () => document.getElementsByClassName('player-playpause')[0].getElementsByTagName('i')[0].classList.contains('bi-pause-circle') ?   StateMode.PLAYING : StateMode.PAUSED,
    title: () => document.querySelector('.player-infos li:last-child')?.textContent?.split('-')[1] ?? '',
    artist: () => document.querySelector('.player-infos li:last-child')?.textContent?.split('-')[0] ?? '',
    album: () => '',
    cover: () => {
      if ((navigator.mediaSession.metadata?.artwork?.length || 0) > 0)
        return getMediaSessionCover()
      return ''
    },
    duration: () => timeInSecondsToString(element?.duration || 0),
    position: () => timeInSecondsToString(element?.currentTime || 0),
    volume: () => (element?.muted ? 0 : (element?.volume || 1) * 100),
    rating: () => 0,
    repeat: () => RepeatMode.NONE,
    shuffle: () => false
  },
  events: {
    togglePlaying: () => document.getElementsByClassName('player-playpause')[0].getElementsByTagName('i')[0].click(),
    next: () => null,
    previous: () => null,// player-sound player-sound-fader
    setPositionSeconds: null,
    setPositionPercentage: null,
    setVolume: (volume: number) => {
        if (document.getElementsByClassName('bi-volume-mute-fill').length > 0 && volume > 0) {
          (document.getElementsByClassName('bi-volume-mute-fill')[0] as HTMLElement).click();
        }
        if (document.getElementsByClassName('bi-volume-up-fill').length > 0 && volume == 0) {
          (document.getElementsByClassName('bi-volume-up-fill')[0] as HTMLElement).click();
        }
    },
    toggleRepeat: null,
    toggleShuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site