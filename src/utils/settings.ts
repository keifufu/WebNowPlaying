export type CustomAdapter = {
  id: string;
  port: number;
  enabled: boolean;
};

export type TSupportedSites =
  | "Generic"
  | "Apple Music"
  | "Bandcamp"
  | "Deezer"
  | "Invidious"
  | "Jellyfin"
  | "Kick"
  | "Navidrome"
  | "Netflix"
  | "Pandora"
  | "Plex"
  | "Radio Addict"
  | "Soundcloud"
  | "Spotify"
  | "Tidal"
  | "Twitch"
  | "VK"
  | "Yandex Music"
  | "YouTube"
  | "YouTube Embeds"
  | "YouTube Music";

export const SupportedSites: TSupportedSites[] = [
  "Apple Music",
  "Bandcamp",
  "Deezer",
  "Invidious",
  "Jellyfin",
  "Kick",
  "Navidrome",
  "Netflix",
  "Pandora",
  "Plex",
  "Radio Addict",
  "Soundcloud",
  "Spotify",
  "Tidal",
  "Twitch",
  "VK",
  "Yandex Music",
  "YouTube",
  "YouTube Embeds",
  "YouTube Music",
];

type TSiteSettings = Partial<{
  [key in TSupportedSites]: {
    name: string;
    description: string;
    key: string;
    type: "checkbox";
  }[];
}>;

export const SiteSettings: TSiteSettings = {
  YouTube: [
    {
      name: "Skip through chapters",
      description:
        "If a video has chapters or a comment with chapter timestamps, skip to the next/previous chapter instead of the next/previous video when using the skip buttons.",
      key: "YouTubeSkipChapters",
      type: "checkbox",
    },
  ],
};

export type Settings = {
  useGeneric: boolean;
  useGenericList: boolean;
  isListBlocked: boolean;
  genericList: string[];
  customAdapters: CustomAdapter[];
  enabledBuiltInAdapters: string[];
  disabledSites: TSupportedSites[];
  useTelemetry: boolean;
  useDesktopPlayers: boolean;
  enabledSanitizationId: SanitizationSettingsId[];
  /* Site Settings */
  YouTubeSkipChapters: boolean;
};

export type SanitizationSettingsId = "sanitizeArtist" | "removeDuplicateArtists" | "sanitizeTitle" | "standardizeFeaturing" | "moveFeaturingToEnd";

export type SanitizationSettings = {
  id: SanitizationSettingsId;
  name: string;
  description: string;
};

export const sanitizationSettings: SanitizationSettings[] = [
  {
    id: "sanitizeArtist",
    name: "Sanitize artist",
    description: 'Remove " - Topic", "VEVO".. from artist names',
  },
  {
    id: "removeDuplicateArtists",
    name: "Remove duplicate artist",
    description: "Remove the artist from the title",
  },
  {
    id: "sanitizeTitle",
    name: "Sanitize title",
    description: 'Remove common junk such as "(Official Music Video)", "(Official Audio)" ...',
  },
  {
    id: "standardizeFeaturing",
    name: "Standardize Featuring",
    description: 'Standardizes "featuring", "feat.", "ft."',
  },
  {
    id: "moveFeaturingToEnd",
    name: "Move Featuring to end",
    description: "Moves featuring to the end of the title",
  },
];

export const defaultSettings: Settings = {
  useGeneric: false,
  useGenericList: false,
  isListBlocked: false,
  genericList: ["streamable.com", "www.adultswim.com"],
  customAdapters: [],
  enabledBuiltInAdapters: ["Rainmeter Adapter"],
  disabledSites: [],
  useTelemetry: false,
  useDesktopPlayers: true,
  enabledSanitizationId: ["sanitizeArtist"],
  /* Site Settings */
  YouTubeSkipChapters: false,
};

export type Adapter = {
  official: boolean;
  name: string;
  // I can't rename adapters because it would reset enabled adapters.
  // I added displayName so I can name them whatever in the settings interface.
  displayName: string;
  port: number;
  gh: string;
  authors: {
    name: string;
    link: string;
  }[];
};

export const BuiltInAdapters: Adapter[] = [
  {
    official: true,
    name: "Rainmeter Adapter",
    displayName: "Rainmeter",
    port: 8974,
    gh: "keifufu/WebNowPlaying-Rainmeter",
    authors: [
      {
        name: "keifufu",
        link: "https://github.com/keifufu",
      },
      {
        name: "tjhrulz",
        link: "https://github.com/tjhrulz",
      },
    ],
  },
  {
    official: true,
    name: "OBS Adapter",
    displayName: "OBS",
    port: 6534,
    gh: "keifufu/WebNowPlaying-OBS",
    authors: [
      {
        name: "keifufu",
        link: "https://github.com/keifufu",
      },
    ],
  },
  {
    official: true,
    name: "CLI Adapter",
    displayName: "CLI",
    port: 5468,
    gh: "keifufu/WebNowPlaying-CLI",
    authors: [
      {
        name: "keifufu",
        link: "https://github.com/keifufu",
      },
    ],
  },
  {
    official: false,
    name: "Macro Deck Adapter",
    displayName: "Macro Deck 2",
    port: 8698,
    gh: "jbcarreon123/WebNowPlaying-Redux-Macro-Deck",
    authors: [
      {
        name: "jbcarreon123",
        link: "https://github.com/jbcarreon123",
      },
    ],
  },
];

export type SocketInfoState = {
  version: string;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  _isPlaceholder?: boolean;
};

export type SocketInfo = {
  states: Map<number, SocketInfoState>;
};

export const defaultSocketInfoState = {
  version: "0.0.0",
  isConnected: false,
  isConnecting: false,
  reconnectAttempts: 0,
  _isPlaceholder: true,
};
