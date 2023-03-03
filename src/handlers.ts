import { getCurrentSite, RepeatMode, SiteInfo, StateMode, WNPReduxWebSocket } from './content'

export function OnMessageLegacy(self: WNPReduxWebSocket, message: string): keyof SiteInfo | null {
  const site = getCurrentSite()
  if (!site || !site.ready()) return null

  let updateInfo: keyof SiteInfo | null = null
  try {
    const [type, data] = message.toUpperCase().split(' ')
    switch (type) {
      case 'PLAYPAUSE': site.events.togglePlaying?.(); updateInfo = 'state'; break
      case 'NEXT': site.events.next?.(); updateInfo = 'title'; break
      case 'PREVIOUS': site.events.previous?.(); updateInfo = 'title'; break
      case 'SETPOSITION': {
        // Example string: SetPosition 34:SetProgress 0,100890207715134:
        const [positionInSeconds, positionPercentageStr] = data.split(':')
        const positionPercentage = positionPercentageStr.split('SETPROGRESS ')[1]
        site.events.setPositionSeconds?.(parseInt(positionInSeconds))
        site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
        updateInfo = 'position'
        break
      }
      case 'SETVOLUME': site.events.setVolume?.(parseInt(data)); updateInfo = 'volume'; break
      case 'REPEAT': site.events.toggleRepeat?.(); updateInfo = 'repeat'; break
      case 'SHUFFLE': site.events.toggleShuffle?.(); updateInfo = 'shuffle'; break
      case 'TOGGLETHUMBSUP': site.events.toggleThumbsUp?.(); updateInfo = 'rating'; break
      case 'TOGGLETHUMBSDOWN': site.events.toggleThumbsDown?.(); updateInfo = 'rating'; break
      case 'RATING': site.events.setRating?.(parseInt(data)); updateInfo = 'rating'; break
      default: break
    }
  } catch (e) {
    self.send(`Error:Error sending event to ${site.info.player()}`)
    self.send(`ErrorD:${e}`)
  }

  return updateInfo
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

export function OnMessageRev1(self: WNPReduxWebSocket, message: string): keyof SiteInfo | null {
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
  if (!site || !site.ready()) return null
  const [type, data] = message.split(' ')

  let updateInfo: keyof SiteInfo | null = null
  try {
    switch (Events[type as keyof typeof Events]) {
      case Events.TOGGLE_PLAYING: site.events.togglePlaying?.(); updateInfo = 'state'; break
      case Events.NEXT: site.events.next?.(); updateInfo = 'title'; break
      case Events.PREVIOUS: site.events.previous?.(); updateInfo = 'title'; break
      case Events.SET_POSITION: {
        const [positionInSeconds, positionPercentage] = data.split(':')
        site.events.setPositionSeconds?.(parseInt(positionInSeconds))
        site.events.setPositionPercentage?.(parseFloat(positionPercentage.replace(',', '.')))
        updateInfo = 'position'
        break
      }
      case Events.SET_VOLUME: site.events.setVolume?.(parseInt(data)); updateInfo = 'volume'; break
      case Events.TOGGLE_REPEAT: site.events.toggleRepeat?.(); updateInfo = 'repeat'; break
      case Events.TOGGLE_SHUFFLE: site.events.toggleShuffle?.(); updateInfo = 'shuffle'; break
      case Events.TOGGLE_THUMBS_UP: site.events.toggleThumbsUp?.(); updateInfo = 'rating'; break
      case Events.TOGGLE_THUMBS_DOWN: site.events.toggleThumbsDown?.(); updateInfo = 'rating'; break
      case Events.SET_RATING: site.events.setRating?.(parseInt(data)); updateInfo = 'rating'; break
      default: break
    }
  } catch (e) {
    self.send(`ERROR Error sending event to ${site.info.player()}`)
    self.send(`ERRORDEBUG ${e}`)
  }

  return updateInfo
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