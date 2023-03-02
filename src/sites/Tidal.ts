import { RepeatMode, Site, StateMode } from '../content'
import { querySelector, querySelectorReport } from '../utils'

let lastKnownVolume = 100

const site: Site = {
  ready: () => querySelector<boolean, HTMLButtonElement>('#footerPlayer', (el) => el !== null, false),
  info: {
    player: () => 'Tidal',
    state: () => querySelectorReport<StateMode, HTMLButtonElement>('#playbackControlBar button[data-test="pause"]', (el) => StateMode.PLAYING, StateMode.PAUSED, 'state'),
    title: () => querySelectorReport<string, HTMLSpanElement>('#footerPlayer span', (el) => el.innerText, '', 'title'),
    artist: () => querySelectorReport<string, HTMLSpanElement>('(#footerPlayer span)[1]', (el) => el.innerText, '', 'artist'),
    album: () =>
      // This will sometimes show the playlist instead of the album, doesn't seem like I can do much about it
      // using textContent instead of innerText because innerText is all capitalized
      querySelectorReport<string, HTMLAnchorElement>('(#footerPlayer a)[2]', (el) => el.textContent, '', 'album'),
    cover: () => querySelectorReport<string, HTMLImageElement>('#footerPlayer img', (el) => el.src.split('/').slice(0, -1).join('/') + '/1280x1280.jpg', '', 'cover'),
    duration: () => querySelectorReport<string, HTMLTimeElement>('(#footerPlayer time)[1]', (el) => el.innerText, '0:00', 'duration'),
    position: () => querySelectorReport<string, HTMLTimeElement>('#footerPlayer time', (el) => el.innerText, '0:00', 'position'),
    volume: () => {
      querySelector<number, HTMLInputElement>('#nativeRange input', (el) => {
        lastKnownVolume = parseInt(el.value)
        return lastKnownVolume
      }, lastKnownVolume)

      return lastKnownVolume
    },
    rating: () => querySelectorReport<number, HTMLButtonElement>('#footerPlayer .favorite-button', (el) => (el.getAttribute('aria-checked') === 'true' ? 5 : 0), 0, 'rating'),
    repeat: () => querySelectorReport<RepeatMode, HTMLButtonElement>('(#playbackControlBar button)[4]', (el) => {
      const repeatButtonDataType = el.getAttribute('data-type')
      if (repeatButtonDataType === 'button__repeatAll') return RepeatMode.ALL
      if (repeatButtonDataType === 'button__repeatSingle') return RepeatMode.ONE
      return RepeatMode.NONE
    }, RepeatMode.NONE, 'repeat'),
    shuffle: () => querySelectorReport<boolean, HTMLButtonElement>('#playbackControlBar button', (el) => el.getAttribute('aria-checked') === 'true', false, 'shuffle')
  },
  events: {
    togglePlaying: () => (document.querySelectorAll<HTMLButtonElement>('#playbackControlBar button')[2].click()),
    next: () => (document.querySelectorAll<HTMLButtonElement>('#playbackControlBar button')[3].click()),
    previous: () => (document.querySelectorAll<HTMLButtonElement>('#playbackControlBar button')[1].click()),
    setPositionSeconds: null,
    setPositionPercentage: (positionPercentage: number) => {
      const el = document.querySelector('div[data-test="interaction-layer"]')
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
    setVolume: null,
    // TODO: this doesn't work for now
    /* setVolume: (volume: number) => {
      const el = document.querySelector('button[data-test="volume"]')
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
        if (document.querySelector('#nativeRange input')) {
          clearInterval(volumeReadyTest)
          const el = document.querySelector('#nativeRange input')
          if (!el) return
          const loc = el.getBoundingClientRect()
          vol *= loc.height

          el.dispatchEvent(new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: loc.left + (loc.width / 2),
            clientY: loc.bottom - vol
          }))
          el.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: loc.left + (loc.width / 2),
            clientY: loc.bottom - vol
          }))
          el.dispatchEvent(new MouseEvent('mouseup', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: loc.left + (loc.width / 2),
            clientY: loc.bottom - vol
          }))

          const el2 = document.querySelector('button[data-test="volume"]')
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
    }, */
    toggleRepeat: () => document.querySelectorAll<HTMLButtonElement>('#playbackControlBar button')[4]?.click(),
    toggleShuffle: () => document.querySelector<HTMLButtonElement>('#playbackControlBar button')?.click(),
    toggleThumbsUp: () => document.querySelector<HTMLButtonElement>('#footerPlayer .favorite-button')?.click(),
    toggleThumbsDown: null,
    setRating: (rating: number) => {
      if (rating >= 3 && site.info.rating?.() !== 5)
        site.events.toggleThumbsUp?.()
      else if (rating < 3 && site.info.rating?.() === 5)
        site.events.toggleThumbsUp?.()
    }
  }
}

export default site