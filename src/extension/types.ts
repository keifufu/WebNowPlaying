import { TSupportedSites } from "../utils/settings";

export enum StateMode {
  STOPPED = "STOPPED",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
}
export enum RepeatMode {
  NONE = "NONE",
  ONE = "ONE",
  ALL = "ALL",
}

export type MediaInfo = {
  playerName: string;
  playerControls: string;
  state: StateMode;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  durationSeconds: number;
  positionSeconds: number;
  volume: number;
  rating: number;
  repeatMode: RepeatMode;
  shuffleActive: boolean;
  timestamp: number;
};

export enum RatingSystem {
  NONE = "NONE",
  LIKE_DISLIKE = "LIKE_DISLIKE",
  LIKE = "LIKE",
  SCALE = "SCALE",
}

export const defaultPlayerControls = {
  supports_play_pause: false,
  supports_skip_previous: false,
  supports_skip_next: false,
  supports_set_position: false,
  supports_set_volume: false,
  supports_toggle_repeat_mode: false,
  supports_toggle_shuffle_active: false,
  supports_set_rating: false,
  rating_system: RatingSystem.NONE,
};

export const defaultMediaInfo: MediaInfo = {
  playerName: "",
  playerControls: JSON.stringify(defaultPlayerControls),
  state: StateMode.STOPPED,
  title: "",
  artist: "",
  album: "",
  coverUrl: "",
  durationSeconds: 0,
  positionSeconds: 0,
  volume: 100,
  rating: 0,
  repeatMode: RepeatMode.NONE,
  shuffleActive: false,
  timestamp: 0,
};

export type SiteInfo = {
  playerName: () => TSupportedSites; // Default '' (empty string)
  state: () => StateMode; // Default StateEnum.STOPPED
  title: () => string; // Default '' (empty string)
  artist: () => string; // Default '' (empty string)
  album: () => string; // Default '' (empty string)
  coverUrl: () => string; // Default '' (empty string)
  durationSeconds: () => number; // Default '0:00'
  positionSeconds: () => number; // Default '0:00'
  volume: () => number; // Default 100
  rating: () => number; // Default 0
  repeatMode: () => RepeatMode; // Default RepeatEnum.NONE
  shuffleActive: () => boolean; // Default false
};

export type Site = {
  isInitialized?: boolean;
  init?: () => void;
  match: () => boolean;
  ready: () => boolean;
  ratingSystem: RatingSystem;
  info: SiteInfo;
  canSkipPrevious: () => boolean;
  canSkipNext: () => boolean;
  events: {
    setState: ((state: StateMode) => void) | null;
    skipPrevious: (() => void) | null;
    skipNext: (() => void) | null;
    setPositionSeconds: ((positionInSeconds: number) => void) | null;
    setPositionPercentage: ((progressPercentage: number) => void) | null;
    setVolume: ((volume: number) => void) | null;
    toggleRepeatMode: (() => void) | null;
    toggleShuffleActive: (() => void) | null;
    setRating: ((rating: number) => void) | null;
  };
};

export type YouTubeVideoDetails = {
  videoId?: string;
  title?: string;
  lengthSeconds?: string;
  keywords?: string[];
  channelId?: string;
  isOwnerViewing?: boolean;
  shortDescription?: string;
  isCrawlable?: boolean;
  thumbnail?: {
    thumbnails: {
      url: string;
      height: number;
      width: number;
    }[];
  };
  allowRatings?: boolean;
  viewCount?: string;
  author?: string;
  isPrivate?: boolean;
  isUnpluggedCorpus?: boolean;
  isLiveContent?: boolean;
};

export type YouTubePlaylistDetails = {
  title: string;
  playlistId: string;
};

export type YouTubeInfo = {
  videoDetails: YouTubeVideoDetails | null;
  playlistDetails: YouTubePlaylistDetails | null;
  containerLocalName: string | null;
};

type NetflixImage = {
  url: string;
  w: number;
  h: number;
};

type NetflixEpisode = {
  thumbs: NetflixImage[];
  title: string;
  seq: number;
};

type NetflixSeason = {
  episodes: NetflixEpisode[];
  title: string;
  longName: string;
  seq: number;
  shortName: string;
};

type NetflixSeasonData = {
  episode: NetflixEpisode;
  season: NetflixSeason;
  seasons: NetflixSeason[];
  title: string;
  type: "movie" | "show";
};

export type NetflixInfo = {
  seasonData: NetflixSeasonData;
  navData: {
    prevId?: string;
    currId?: string;
    nextId?: string;
  };
  metadata: {
    _metadata: {
      video: {
        artwork: NetflixImage[];
        boxart: NetflixImage[];
        storyart: NetflixImage[];
        title: string;
        type: "movie" | "show";
      };
    };
  };
  isPlayerReady: boolean;
};
