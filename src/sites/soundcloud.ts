import { Site } from '../content'
import { getMediaSessionCover } from '../utils'

const site: Site = {
  ready: () => navigator.mediaSession.metadata !== null,
  info: {
    player: () => 'Soundcloud',
    state: () => (navigator.mediaSession.playbackState === 'playing' ? 1 : 2),
    title: () => navigator.mediaSession.metadata?.title || '',
    artist: () => navigator.mediaSession.metadata?.artist || '',
    album: () => navigator.mediaSession.metadata?.album || '',
    cover: () => getMediaSessionCover(),
    duration: () => document.querySelectorAll<HTMLElement>('.playbackTimeline__duration > span')[1]?.innerText || '',
    position: () => document.querySelectorAll<HTMLElement>('.playbackTimeline__timePassed > span')[1]?.innerText || '',
    volume: () => (parseInt(document.querySelector<HTMLElement>('.volume__sliderProgress')?.style.height || '1') / (document.querySelector('.volume__sliderBackground')?.getBoundingClientRect().height || 1)) * 100,
    rating: () => (document.querySelector('.playbackSoundBadge__like')?.className.includes('selected') ? 5 : 0),
    repeat: () => {
      if (document.querySelectorAll('.m-one').length > 0)
        return 2
      if (document.querySelectorAll('.m-all').length > 0)
        return 1
      return 0
    },
    shuffle: () => (document.querySelectorAll('.m-shuffling').length > 0 ? 1 : 0)
  },
  events: {
    playpause: () => document.querySelector<HTMLButtonElement>('.playControl')?.click(),
    next: () => document.querySelector<HTMLButtonElement>('.skipControl__next')?.click(),
    previous: () => document.querySelector<HTMLButtonElement>('.skipControl__previous')?.click(),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      const el = document.querySelector('.playbackTimeline__progressWrapper')
      if (!el) return
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
    },
    setVolume: (volume: number) => {
      const el = document.querySelector('.volume')
      if (!el) return
      el.dispatchEvent(new MouseEvent('mouseover', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
      }))
      el.dispatchEvent(new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
      }))

      let counter = 0
      let vol = volume
      const volumeReadyTest = setInterval(() => {
        if (document.querySelector('.volume.expanded.hover')) {
          clearInterval(volumeReadyTest)
          const el = document.querySelector('.volume__sliderBackground')
          if (!el) return
          const loc = el.getBoundingClientRect()
          vol *= loc.height

          el.dispatchEvent(new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: loc.left + (loc.width / 2),
            clientY: loc.bottom - vol + 5
          }))
          el.dispatchEvent(new MouseEvent('mouseup', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: loc.left + (loc.width / 2),
            clientY: loc.bottom - vol + 5
          }))

          const el2 = document.querySelector('.volume')
          if (!el2) return
          el2.dispatchEvent(new MouseEvent('mouseout', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0
          }))
        } else {
          counter += 1
          if (counter > 10)
            clearInterval(volumeReadyTest)
        }
      }, 25)
    },
    repeat: () => document.querySelector<HTMLButtonElement>('.repeatControl')?.click(),
    shuffle: () => document.querySelector<HTMLButtonElement>('.shuffleControl')?.click(),
    toggleThumbsUp: () => document.querySelector<HTMLButtonElement>('.playbackSoundBadge__like')?.click(),
    toggleThumbsDown: null,
    rating: (rating: number) => {
      if (rating >= 3 && site.info.rating?.() !== 5)
        site.events.toggleThumbsUp?.()
      else if (rating < 3 && site.info.rating?.() === 5)
        site.events.toggleThumbsUp?.()
    }
  }
}

export default site