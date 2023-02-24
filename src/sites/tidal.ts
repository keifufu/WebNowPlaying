import { Site } from '../content'

let lastKnownVolume = 100

const site: Site = {
  ready: () => document.querySelector('#footerPlayer') !== null,
  info: {
    player: () => 'Tidal',
    state: () => (document.querySelectorAll('#playbackControlBar button')[2].getAttribute('data-test') === 'pause' ? 1 : 2),
    title: () => document.querySelector<HTMLSpanElement>('#footerPlayer span')?.innerText || '',
    artist: () => document.querySelectorAll<HTMLSpanElement>('#footerPlayer span')[1]?.innerText || '',
    album: () =>
      // This will sometimes show the playlist instead of the album, doesn't seem like I can do much about it
      // using textContent instead of innerText because innerText is all capitalized
      document.querySelectorAll('#footerPlayer a')[2]?.textContent || '',
    cover: () => document.querySelector<HTMLImageElement>('#footerPlayer img')?.src.split('/').slice(0, -1).join('/') + '/1280x1280.jpg' || '',
    duration: () => document.querySelectorAll<HTMLElement>('#footerPlayer time')[1]?.innerText || '0:00',
    position: () => document.querySelector<HTMLElement>('#footerPlayer time')?.innerText || '0:00',
    volume: () => {
      const volumeInput = document.querySelector<HTMLInputElement>('#nativeRange input')
      if (volumeInput)
        lastKnownVolume = parseInt(volumeInput.value)
      return lastKnownVolume
    },
    rating: () => (document.querySelector('#footerPlayer .favorite-button')?.getAttribute('aria-checked') === 'true' ? 5 : 0),
    repeat: () => {
      // eslint-disable-next-line prefer-destructuring
      const repeatButton = document.querySelectorAll('#playbackControlBar button')[4]
      if (repeatButton.getAttribute('aria-checked') === 'false') return 0
      if (repeatButton.getAttribute('data-test') === 'One') return 2
      return 1
    },
    shuffle: () => (document.querySelector('#playbackControlBar button')?.getAttribute('aria-checked') === 'true' ? 1 : 0)
  },
  events: {
    playpause: () => (document.querySelectorAll<HTMLButtonElement>('#playbackControlBar button')[2].click()),
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
    repeat: () => document.querySelectorAll<HTMLButtonElement>('#playbackControlBar button')[4]?.click(),
    shuffle: () => document.querySelector<HTMLButtonElement>('#playbackControlBar button')?.click(),
    toggleThumbsUp: () => document.querySelector<HTMLButtonElement>('#footerPlayer .favorite-button')?.click(),
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