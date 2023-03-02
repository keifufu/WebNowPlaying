import { getCurrentSite, RepeatMode, SiteInfo, StateMode, WNPReduxWebSocket } from './content'

export function OnMessageLegacy(self: WNPReduxWebSocket, message: string) {
  const site = getCurrentSite()
  if (!site || !site.ready()) return self.send('Error:Error sending event: No site found or site not ready.')

  try {
    const [type, data] = message.toUpperCase().split(' ')
    switch (type) {
      case 'PLAYPAUSE': site.events.togglePlaying?.(); break
      case 'NEXT': site.events.next?.(); break
      case 'PREVIOUS': site.events.previous?.(); break
      case 'SETPOSITION': {
        // Example string: SetPosition 34:SetProgress 0,100890207715134:
        const [positionInSeconds, positionPercentageStr] = data.split(':')
        const positionPercentage = positionPercentageStr.split('SETPROGRESS ')[1]
        site.events.setPositionSeconds?.(parseInt(positionInSeconds))
        site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
        break
      }
      case 'SETVOLUME': site.events.setVolume?.(parseInt(data)); break
      case 'REPEAT': site.events.toggleRepeat?.(); break
      case 'SHUFFLE': site.events.toggleShuffle?.(); break
      case 'TOGGLETHUMBSUP': site.events.toggleThumbsUp?.(); break
      case 'TOGGLETHUMBSDOWN': site.events.toggleThumbsDown?.(); break
      case 'RATING': site.events.setRating?.(parseInt(data)); break
      default: break
    }
  } catch (e) {
    self.send(`Error:Error sending event to ${site.info.player()}`)
    self.send(`ErrorD:${e}`)
  }
}

export function SendUpdateLegacy(self: WNPReduxWebSocket) {
  const site = getCurrentSite()
  if (!site || !site.ready()) {
    if (self.cache.state !== 0) {
      self.send('STATE:0')
      self.cache.state = 0
    }
    return
  }

  const values: (keyof SiteInfo)[] = ['state', 'player', 'title', 'artist', 'album', 'cover', 'duration', 'position', 'volume', 'rating', 'repeat', 'shuffle']
  values.forEach((key) => {
    try {
      let value = site.info[key]?.()
      // For numbers, round it to an integer
      if (typeof value === 'number')
        value = Math.round(value)

      // Conversion to legacy values
      if (key === 'state')
        value = value === StateMode.PLAYING ? 1 : value === StateMode.PAUSED ? 2 : 0
      else if (key === 'repeat')
        value = value === RepeatMode.ALL ? 2 : value === RepeatMode.ONE ? 1 : 0
      else if (key === 'shuffle')
        value = value ? 1 : 0

      // Check for null, and not just falsy, because 0 and '' are falsy
      if (value !== null && value !== self.cache[key]) {
        self.send(`${key.toUpperCase()}:${value}`)
        self.cache[key] = value
      }
    } catch (e) {
      self.send(`Error:Error updating ${key} for ${site.info.player()}`)
      self.send(`ErrorD:${e}`)
    }
  })
}

export function OnMessageRev1(self: WNPReduxWebSocket, message: string) {
  enum Events {
    TOGGLE_PLAYING,
    NEXT,
    PREVIOUS,
    SET_POSITION,
    SET_VOLUME,
    TOGGLE_REPEAT,
    TOGGLE_SHUFFLE,
    TOGGLE_THUMBS_UP,
    TOGGLE_THUMBS_DOWN,
    SET_RATING
  }

  const site = getCurrentSite()
  if (!site || !site.ready()) return self.send('ERROR Error sending event: No site found or site not ready.')
  const [type, data] = message.split(' ')

  try {
    switch (Events[type as keyof typeof Events]) {
      case Events.TOGGLE_PLAYING: site.events.togglePlaying?.(); break
      case Events.NEXT: site.events.next?.(); break
      case Events.PREVIOUS: site.events.previous?.(); break
      case Events.SET_POSITION: {
        const [positionInSeconds, positionPercentage] = data.split(':')
        site.events.setPositionSeconds?.(parseInt(positionInSeconds))
        site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
        break
      }
      case Events.SET_VOLUME: site.events.setVolume?.(parseInt(data)); break
      case Events.TOGGLE_REPEAT: site.events.toggleRepeat?.(); break
      case Events.TOGGLE_SHUFFLE: site.events.toggleShuffle?.(); break
      case Events.TOGGLE_THUMBS_UP: site.events.toggleThumbsUp?.(); break
      case Events.TOGGLE_THUMBS_DOWN: site.events.toggleThumbsDown?.(); break
      case Events.SET_RATING: site.events.setRating?.(parseInt(data)); break
      default: break
    }
  } catch (e) {
    self.send(`ERROR Error sending event to ${site.info.player()}`)
    self.send(`ERRORDEBUG ${e}`)
  }
}

export function SendUpdateRev1(self: WNPReduxWebSocket) {
  const site = getCurrentSite()
  if (!site || !site.ready()) {
    if (self.cache.state !== StateMode.STOPPED) {
      self.send(`STATE ${StateMode.STOPPED}`)
      self.cache.state = StateMode.STOPPED
    }
    return
  }

  const values: (keyof SiteInfo)[] = ['state', 'player', 'title', 'artist', 'album', 'cover', 'duration', 'position', 'volume', 'rating', 'repeat', 'shuffle']
  values.forEach((key) => {
    try {
      let value = site.info[key]?.()
      // For numbers, round it to an integer
      if (typeof value === 'number')
        value = Math.round(value)
      // Check for null, and not just falsy, because 0 and '' are falsy
      if (value !== null && value !== self.cache[key]) {
        self.send(`${key.toUpperCase()} ${value}`)
        self.cache[key] = value
      }
    } catch (e) {
      self.send(`ERROR Error updating ${key} for ${site.info.player()}`)
      self.send(`ERRORDEBUG ${e}`)
    }
  })
}