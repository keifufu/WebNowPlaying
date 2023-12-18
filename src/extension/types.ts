import { TSupportedSites } from "../utils/settings";

export class EventError extends Error {
  constructor() {
    super();
    this.name = "EventError";
  }
}

export enum EventResult {
  SUCCEEDED = 1,
  FAILED = 2,
}

export enum StateMode {
  PLAYING = 0,
  PAUSED = 1,
  STOPPED = 2,
}

export enum RatingSystem {
  NONE = 0,
  LIKE = 1,
  LIKE_DISLIKE = 2,
  SCALE = 3,
}

export enum Repeat {
  NONE = 1 << 0,
  ALL = 1 << 1,
  ONE = 1 << 2,
}

export type Player = {
  id: number;
  name: TSupportedSites;
  title: string;
  artist: string;
  album: string;
  cover: string;
  state: StateMode;
  position: number;
  duration: number;
  volume: number;
  rating: number;
  repeat: Repeat;
  shuffle: boolean;
  ratingSystem: RatingSystem;
  availableRepeat: number;
  canSetState: boolean;
  canSkipPrevious: boolean;
  canSkipNext: boolean;
  canSetPosition: boolean;
  canSetVolume: boolean;
  canSetRating: boolean;
  canSetRepeat: boolean;
  canSetShuffle: boolean;
  createdAt: number;
  updatedAt: number;
  activeAt: number;
};

export const defaultPlayer: Player = {
  id: 0,
  name: "" as any,
  title: "",
  artist: "",
  album: "",
  cover: "",
  state: StateMode.STOPPED,
  duration: 0,
  position: 0,
  volume: 100,
  rating: 0,
  repeat: Repeat.NONE,
  shuffle: false,
  ratingSystem: RatingSystem.NONE,
  availableRepeat: Repeat.NONE,
  canSetState: false,
  canSkipPrevious: false,
  canSkipNext: false,
  canSetPosition: false,
  canSetVolume: false,
  canSetRating: false,
  canSetRepeat: false,
  canSetShuffle: false,
  createdAt: 0,
  updatedAt: 0,
  activeAt: 0,
};

export type SiteControls = {
  ratingSystem: RatingSystem;
  availableRepeat: Repeat;
  canSetState: boolean;
  canSkipPrevious: boolean;
  canSkipNext: boolean;
  canSetPosition: boolean;
  canSetVolume: boolean;
  canSetRating: boolean;
  canSetRepeat: boolean;
  canSetShuffle: boolean;
};

export type Site = {
  init: (() => void) | null;
  ready: () => boolean;
  info: {
    name: () => TSupportedSites;
    title: () => string;
    artist: () => string;
    album: () => string;
    cover: () => string;
    state: () => StateMode;
    duration: () => number;
    position: () => number;
    volume: () => number;
    rating: () => number;
    repeat: () => Repeat;
    shuffle: () => boolean;
  };
  events: {
    setState: ((state: StateMode) => void) | null;
    skipPrevious: (() => void) | null;
    skipNext: (() => void) | null;
    setPosition: ((seconds: number) => void) | null;
    setVolume: ((volume: number) => void) | null;
    setRating: ((rating: number) => void) | null;
    setRepeat: ((repeat: Repeat) => void) | null;
    setShuffle: ((shuffle: boolean) => void) | null;
  };
  controls: () => SiteControls;
};

export type SiteFunctions = keyof Site["events"] | "init" | "getPlayerOptimized" | "getPlayer";

export type SiteArgs = {
  init: undefined;
  getPlayerOptimized: undefined;
  getPlayer: undefined;
  setState: StateMode;
  skipPrevious: undefined;
  skipNext: undefined;
  setPosition: number;
  setVolume: number;
  setRating: number;
  setRepeat: Repeat;
  setShuffle: boolean;
};

export type SiteReturnValues = {
  init: undefined;
  getPlayerOptimized: Player | null;
  getPlayer: Player;
  setState: EventResult;
  skipPrevious: EventResult;
  skipNext: EventResult;
  setPosition: EventResult;
  setVolume: EventResult;
  setRating: EventResult;
  setRepeat: EventResult;
  setShuffle: EventResult;
};

export type SiteIndex = {
  match: () => boolean;
  name: TSupportedSites;
  exec: <T extends SiteFunctions>(func: T, args: SiteArgs[T], shouldThrow?: boolean) => Promise<SiteReturnValues[T]>;
};
