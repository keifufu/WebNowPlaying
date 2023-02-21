import { Site } from '../content'

const site: Site = {
  ready: () => false,
  info: {
    player: () => '', // The name of the player
    state: () => 2, // 1 = playing, 2 = paused
    title: () => '', // The title of the current song
    artist: () => '', // The artist of the current song
    album: () => '', // The album of the current song
    cover: () => '', // A link to the cover image of the current song
    duration: () => '0:00', // The duration of the current song (mm:ss)
    position: () => '0:00', // The current position of the song (mm:ss)
    volume: () => 0, // The volume of the player (1-100)
    rating: () => 0, // The rating of the current song (1-5)
    repeat: () => 0, // 0 = no repeat, 1 = repeat song, 2 = repeat playlist
    shuffle: () => 0 // 0 = no shuffle, 1 = shuffle
  },
  events: {
    playpause: null,
    next: null,
    previous: null,
    setPositionSeconds: null,
    setPositionPercentage: null,
    setVolume: null,
    repeat: null,
    shuffle: null,
    toggleThumbsUp: null,
    toggleThumbsDown: null,
    rating: null
  }
}

export default site