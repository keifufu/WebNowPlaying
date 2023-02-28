import { RepeatMode, Site, StateMode } from '../content'
import { getMediaSessionCover, timeInSecondsToString } from '../utils'

const site: Site = {
  ready: () => navigator.mediaSession.metadata !== null && document.querySelector('audio') !== null,
  info: {
    player: () => 'Apple Music',
    // Supports mediaSession.metadata, but not mediaSession.playbackState
    state: () => (document.querySelector('audio')?.paused ? StateMode.PAUSED : StateMode.PLAYING),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    cover: () => getMediaSessionCover(),
    duration: () => timeInSecondsToString(document.querySelector('audio')?.duration || 0),
    position: () => timeInSecondsToString(document.querySelector('audio')?.currentTime || 0),
    volume: () => (document.querySelector('audio')?.volume || 0) * 100,
    rating: null,
    repeat: () => {
      const repeatButton = document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-repeat')?.shadowRoot?.querySelector('.button--repeat')
      return repeatButton?.classList.contains('mode--0') ? RepeatMode.NONE : repeatButton?.classList.contains('mode--1') ? RepeatMode.ONE : RepeatMode.ALL
    },
    shuffle: () => {
      const shuffleButton = document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-shuffle')?.shadowRoot?.querySelector('.button--shuffle')
      return shuffleButton?.classList.contains('shuffled') || false
    }
  },
  events: {
    togglePlaying: () => {
      const audio = document.querySelector('audio')
      site.info.state() === StateMode.PLAYING ? audio?.pause() : audio?.play()
    },
    next: () => document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-item-skip[class="next"]')?.shadowRoot?.querySelector<HTMLButtonElement>('.button--next')?.click(),
    previous: () => document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-item-skip[class="previous"]')?.shadowRoot?.querySelector<HTMLButtonElement>('.button--previous')?.click(),
    setPositionSeconds: (positionInSeconds: number) => {
      const audio = document.querySelector('audio')
      if (audio) audio.currentTime = positionInSeconds
    },
    setPositionPercentage: null,
    setVolume: (volume: number) => {
      const audio = document.querySelector('audio')
      if (audio) audio.volume = volume / 100
    },
    toggleRepeat: () => document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-repeat')?.shadowRoot?.querySelector<HTMLButtonElement>('.button--repeat')?.click(),
    toggleShuffle: () => document.querySelector('amp-chrome-player')?.shadowRoot?.querySelector('apple-music-playback-controls')?.shadowRoot?.querySelector('amp-playback-controls-shuffle')?.shadowRoot?.querySelector<HTMLButtonElement>('.button--shuffle')?.click(),
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    setRating: null
  }
}

export default site