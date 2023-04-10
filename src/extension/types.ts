import { TSupportedSites } from '../utils/settings'

export enum StateMode { STOPPED = 'STOPPED', PLAYING = 'PLAYING', PAUSED = 'PAUSED' }
export enum RepeatMode { NONE = 'NONE', ONE = 'ONE', ALL = 'ALL' }

export type MediaInfo = {
  player: string
  state: StateMode
  title: string
  artist: string
  album: string
  cover: string
  duration: string
  position: string
  volume: number
  rating: number
  repeat: RepeatMode
  shuffle: boolean
  timestamp: number
}

export const defaultMediaInfo: MediaInfo = {
  player: '',
  state: StateMode.STOPPED,
  title: '',
  artist: '',
  album: '',
  cover: '',
  duration: '0:00',
  position: '0:00',
  volume: 100,
  rating: 0,
  repeat: RepeatMode.NONE,
  shuffle: false,
  timestamp: 0
}

export type SiteInfo = {
  player: () => TSupportedSites, // Default '' (empty string)
  state: () => StateMode // Default StateEnum.STOPPED
  title: () => string // Default '' (empty string)
  artist: () => string // Default '' (empty string)
  album: () => string // Default '' (empty string)
  cover: () => string // Default '' (empty string)
  duration: () => string // Default '0:00'
  position: () => string // Default '0:00'
  volume: () => number // Default 100
  rating: () => number // Default 0
  repeat: () => RepeatMode // Default RepeatEnum.NONE
  shuffle: () => boolean // Default false
}

export type Site = {
  isInitialized?: boolean,
  init?: () => void
  match: () => boolean,
  ready: () => boolean
  info: SiteInfo
  events: {
    togglePlaying: (() => void) | null
    next: (() => void) | null
    previous: (() => void) | null
    setPositionSeconds: ((positionInSeconds: number) => void) | null
    setPositionPercentage: ((progressPercentage: number) => void) | null
    setVolume: ((volume: number) => void) | null
    toggleRepeat: (() => void) | null
    toggleShuffle: (() => void) | null
    toggleThumbsUp: (() => void) | null
    toggleThumbsDown: (() => void) | null
    setRating: ((rating: number) => void) | null
  }
}

export type YouTubeVideoDetails = {
  videoId?: string
  title?: string
  lengthSeconds?: string
  keywords?: string[]
  channelId?: string
  isOwnerViewing?: boolean
  shortDescription?: string
  isCrawlable?: boolean
  thumbnail?: {
    thumbnails: {
      url: string
      height: number
      width: number
    }[]
  }
  allowRatings?: boolean
  viewCount?: string
  author?: string
  isPrivate?: boolean
  isUnpluggedCorpus?: boolean
  isLiveContent?: boolean
}

export type YouTubePlaylistDetails = {
  title: string
  playlistId: string
}

export type YouTubeInfo = {
  videoDetails: YouTubeVideoDetails | null
  playlistDetails: YouTubePlaylistDetails | null
  containerLocalName: string | null
}

type NetflixImage = {
  url: string
  w: number
  h: number
}

type NetflixEpisode = {
  thumbs: NetflixImage[]
  title: string
  seq: number
}

type NetflixSeason = {
  episodes: NetflixEpisode[]
  title: string
  longName: string
  seq: number
  shortName: string
}

type NetflixSeasonData = {
  episode: NetflixEpisode
  season: NetflixSeason
  seasons: NetflixSeason[]
  title: string,
  type: 'movie' | 'show'
}

export type NetflixInfo = {
  seasonData: NetflixSeasonData
  navData: {
    prevId?: string
    currId?: string
    nextId?: string
  }
  metadata: {
    _metadata: {
      video: {
        artwork: NetflixImage[]
        boxart: NetflixImage[]
        storyart: NetflixImage[]
        title: string,
        type: 'movie' | 'show'
      }
    }
  }
  isPlayerReady: boolean
}