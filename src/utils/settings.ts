export type CustomAdapter = {
  id: string
  port: number
  enabled: boolean
}

export type TSupportedSites = 'Apple Music' | 'Bandcamp' | 'Deezer' | 'Invidious' | 'Jellyfin' | 'Navidrome' | 'Netflix' | 'Pandora' | 'Plex' | 'Radio Addict' | 'Soundcloud' | 'Spotify' | 'Tidal' | 'Twitch' | 'YouTube' | 'YouTube Embeds' | 'YouTube Music'
export const SupportedSites: TSupportedSites[] = ['Apple Music', 'Bandcamp', 'Deezer', 'Invidious', 'Jellyfin', 'Navidrome', 'Netflix', 'Pandora', 'Plex', 'Radio Addict', 'Soundcloud', 'Spotify', 'Tidal', 'Twitch', 'YouTube', 'YouTube Embeds', 'YouTube Music']

type TSiteSettings = Partial<{
  [key in TSupportedSites]: {
    name: string
    description: string
    key: string
    type: 'checkbox'
  }[]
}>

export const SiteSettings: TSiteSettings = {
  YouTube: [
    {
      name: 'Skip through chapters',
      description: 'If a video has chapters or a comment with chapter timestamps, skip to the next/previous chapter instead of the next/previous video when using the skip buttons.',
      key: 'YouTubeSkipChapters',
      type: 'checkbox'
    }
  ]
}

export const DEFAULT_UPDATE_FREQUENCY = 250

export type Settings = {
  useGeneric: boolean
  useGenericList: boolean
  isListBlocked: boolean
  genericList: string[]
  customAdapters: CustomAdapter[]
  enabledBuiltInAdapters: string[]
  disabledSites: TSupportedSites[]
  useTelemetry: boolean,
  useNativeAPIs: boolean,
  /* Site Settings */
  YouTubeSkipChapters: boolean
}

export const defaultSettings: Settings = {
  useGeneric: false,
  useGenericList: false,
  isListBlocked: false,
  genericList: ['streamable.com', 'www.adultswim.com'],
  customAdapters: [],
  enabledBuiltInAdapters: ['Rainmeter Adapter'],
  disabledSites: [],
  useTelemetry: false,
  useNativeAPIs: true,
  /* Site Settings */
  YouTubeSkipChapters: false
}

export type Adapter = {
  name: string,
  port: number,
  gh: string,
  authors: {
    name: string,
    link: string
  }[]
}

export const BuiltInAdapters: Adapter[] = [
  {
    name: 'Rainmeter Adapter',
    port: 8974,
    gh: 'keifufu/WebNowPlaying-Redux-Rainmeter',
    authors: [
      {
        name: 'keifufu',
        link: 'https://github.com/keifufu'
      },
      {
        name: 'tjhrulz',
        link: 'https://github.com/tjhrulz'
      }
    ]
  },
  {
    name: 'Macro Deck Adapter',
    port: 8698,
    gh: 'jbcarreon123/WebNowPlaying-Redux-Macro-Deck',
    authors: [
      {
        name: 'jbcarreon123',
        link: 'https://github.com/jbcarreon123'
      }
    ]
  },
  {
    name: 'OBS Adapter',
    port: 6534,
    gh: 'keifufu/WebNowPlaying-Redux-OBS',
    authors: [
      {
        name: 'keifufu',
        link: 'https://github.com/keifufu'
      }
    ]
  }
]

export type SocketInfoState = {
  version: string,
  isConnected: boolean,
  isConnecting: boolean,
  reconnectAttempts: number
  _isPlaceholder?: boolean
}
export type SocketInfo = {
  forceEnableNativeAPIs: boolean
  states: Map<number, SocketInfoState>
}
export const defaultSocketInfoState = {
  version: '0.0.0',
  isConnected: false,
  isConnecting: false,
  reconnectAttempts: 0,
  _isPlaceholder: true
}