export type CustomAdapter = {
  port: number
  enabled: boolean
}

export type TSupportedSites = 'Apple Music' | 'Bandcamp' | 'Deezer' | 'Invidious' | 'Navidrome' | 'Netflix' | 'Pandora' | 'Plex' | 'Radio Addict' | 'Soundcloud' | 'Spotify' | 'Tidal' | 'Twitch' | 'YouTube' | 'YouTube Embeds' | 'YouTube Music'
export const SupportedSites: TSupportedSites[] = ['Apple Music', 'Bandcamp', 'Deezer', 'Invidious', 'Navidrome', 'Netflix', 'Pandora', 'Plex', 'Radio Addict', 'Soundcloud', 'Spotify', 'Tidal', 'Twitch', 'YouTube', 'YouTube Embeds', 'YouTube Music']

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

// updateFrequencyMs was previously in use as a object to store the update frequency
// for each adapter.
// We could either have migration code or just rename it to updateFrequencyMs2.
export type Settings = {
  updateFrequencyMs2: number
  useGeneric: boolean
  useGenericList: boolean
  isListBlocked: boolean
  genericList: string[]
  customAdapters: CustomAdapter[]
  enabledBuiltInAdapters: string[]
  disabledSites: TSupportedSites[]
  useTelemetry: boolean,
  /* Site Settings */
  YouTubeSkipChapters: boolean
}

export const defaultSettings: Settings = {
  updateFrequencyMs2: 250,
  useGeneric: false,
  useGenericList: false,
  isListBlocked: false,
  genericList: ['streamable.com', 'www.adultswim.com'],
  customAdapters: [],
  enabledBuiltInAdapters: ['Rainmeter Adapter'],
  disabledSites: [],
  useTelemetry: false,
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