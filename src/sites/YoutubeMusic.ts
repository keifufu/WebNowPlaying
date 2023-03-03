import { RepeatMode, Site, StateMode } from '../content'
import { getMediaSessionCover, querySelector, querySelectorEventReport, querySelectorReport } from '../utils'

// I'm not using mediaSession here because of ads.
// Of course this isn't an issue with YouTube Premium or adblock, but still.
const site: Site = {
  ready: () => document.querySelector('video') !== null && querySelector<boolean, HTMLButtonElement>('.title.ytmusic-player-bar', (el) => el.innerText.length > 0, false),
  info: {
    player: () => 'Youtube Music',
    state: () => querySelectorReport<StateMode, HTMLVideoElement>('video', (el) => (el.paused ? StateMode.PAUSED : StateMode.PLAYING), StateMode.PAUSED, 'state'),
    title: () => querySelectorReport<string, HTMLElement>('.title.ytmusic-player-bar', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLElement>('.byline.ytmusic-player-bar a', (el) => el.innerText, '', 'artist'),
    album: () => querySelectorReport<string, HTMLElement>('(.byline.ytmusic-player-bar a)[1]', (el) => el.innerText, '', 'album'),
    // I'm not sure if it shows ads on youtube music but I can't be bothered to not use the mediaSession cover
    // The cover img's src is sometimes a googleusercontent link
    cover: () => getMediaSessionCover(),
    duration: () => querySelectorReport<string, HTMLElement>('.time-info.ytmusic-player-bar', (el) => el.innerText.split(' / ')[1], '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLElement>('.time-info.ytmusic-player-bar', (el) => el.innerText.split(' / ')[0], '0:00', 'position'),
    volume: () => querySelectorReport<number, HTMLVideoElement>('video', (el) => (el.muted ? 0 : el.volume * 100), 100, 'volume'),
    rating: () => {
      const likeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>('(.middle-controls-buttons yt-button-shape)[1]', (el) => el.getAttribute('aria-pressed') === 'true', false, 'rating')
      if (likeButtonPressed) return 5
      const dislikeButtonPressed = querySelectorReport<boolean, HTMLButtonElement>('.middle-controls-buttons yt-button-shape', (el) => el.getAttribute('aria-pressed') === 'true', false, 'rating')
      if (dislikeButtonPressed) return 1
      return 0
    },
    repeat: () => querySelectorReport<RepeatMode, HTMLElement>('ytmusic-player-bar', (el) => {
      const repeatMode = el.getAttribute('repeat-mode_')
      if (repeatMode === 'ALL') return RepeatMode.ALL
      if (repeatMode === 'ONE') return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeat'),
    // Youtube music doesn't do shuffling the traditional way, it just shuffles the current queue with no way of undoing it
    shuffle: () => false
  },
  events: {
    togglePlaying: () => querySelectorEventReport<HTMLButtonElement>('#play-pause-button', (el) => el.click(), 'togglePlaying'),
    next: () => querySelectorEventReport<HTMLButtonElement>('.next-button', (el) => el.click(), 'next'),
    previous: () => querySelectorEventReport<HTMLButtonElement>('.previous-button', (el) => el.click(), 'previous'),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      querySelectorEventReport<HTMLElement>('#progress-bar tp-yt-paper-progress', (el) => {
        const loc = el.getBoundingClientRect()
        const position = positionPercentage * loc.width

        el.dispatchEvent(new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + position,
          clientY: loc.top + (loc.height / 2)
        }))
        el.dispatchEvent(new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: loc.left + position,
          clientY: loc.top + (loc.height / 2)
        }))
      }, 'setPositionPercentage')
    },
    setVolume: (volume: number) => {
      querySelectorEventReport<HTMLVideoElement>('video', (el) => {
        el.volume = volume / 100
        if (volume === 0) el.muted = true
        else el.muted = false
      }, 'setVolume')
    },
    toggleRepeat: () => querySelectorEventReport<HTMLButtonElement>('.repeat', (el) => el.click(), 'toggleRepeat'),
    toggleShuffle: () => querySelectorEventReport<HTMLButtonElement>('.shuffle', (el) => el.click(), 'toggleShuffle'),
    toggleThumbsUp: () => querySelectorEventReport<HTMLButtonElement>('(.middle-controls-buttons button)[1]', (el) => el.click(), 'toggleThumbsUp'),
    toggleThumbsDown: () => querySelectorEventReport<HTMLButtonElement>('.middle-controls-buttons button', (el) => el.click(), 'toggleThumbsDown'),
    setRating: (rating: number) => {
      if (rating >= 3 && site.info.rating?.() !== 5)
        site.events.toggleThumbsUp?.()
      else if (rating < 3 && site.info.rating?.() !== 1)
        site.events.toggleThumbsDown?.()
    }
  }
}

export default site