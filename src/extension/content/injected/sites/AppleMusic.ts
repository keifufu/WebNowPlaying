import { RatingSystem, Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo } from "../utils";

const getMusicKit = () => (window as any).MusicKit;
const getInstance = () => getMusicKit()?.getInstance();

const AppleMusic: Site = {
  debug: {
    getMusicKit,
    getInstance,
  },
  init: null,
  ready: () => !!getInstance(),
  info: createSiteInfo({
    name: () => "Apple Music",
    title: () => getInstance()?.nowPlayingItem?.attributes.name ?? "",
    artist: () => getInstance()?.nowPlayingItem?.attributes.artistName ?? "",
    album: () => getInstance()?.nowPlayingItem?.attributes.albumName ?? "",
    cover: () => {
      const artwork = getInstance()?.nowPlayingItem?.attributes.artwork;
      if (!artwork) return "";
      const url = getMusicKit()?.formatArtworkURL?.(artwork, 512, 512);
      if (url) return url;
      return "";
    },
    state: () => {
      const playbackState = getInstance()?.playbackState;
      switch (playbackState) {
        default:
        case 0:
        case 1:
          return StateMode.STOPPED;
        case 2:
          return StateMode.PLAYING;
        case 3:
          return StateMode.PAUSED;
      }
    },
    position: () => getInstance()?.currentPlaybackTime ?? 0,
    duration: () => getInstance()?.currentPlaybackDuration ?? 0,
    volume: () => getInstance()?.volume * 100 ?? 100,
    rating: () => 0,
    repeat: () => {
      const mode = getInstance()?.repeatMode;
      switch (mode) {
        default:
        case 0:
          return Repeat.NONE;
        case 1:
          return Repeat.ONE;
        case 2:
          return Repeat.ALL;
      }
    },
    shuffle: () => getInstance()?.shuffleMode == 1 ?? false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          _throw(getInstance().play)();
          break;
        case StateMode.PAUSED:
          _throw(getInstance().pause)();
          break;
        case StateMode.PLAYING:
          _throw(getInstance().play)();
          break;
      }
    },
    skipPrevious: () => _throw(getInstance()?.skipToPreviousItem)(),
    skipNext: () => _throw(getInstance()?.skipToNextItem)(),
    setPosition: (seconds) => _throw(getInstance()?.seekToTime)(seconds),
    setVolume: (volume) => (_throw(getInstance()).volume = volume / 100),
    setRating: null,
    setRepeat: (repeat) => {
      switch (repeat) {
        case Repeat.NONE:
          _throw(getInstance()).repeatMode = 0;
          break;
        case Repeat.ONE:
          _throw(getInstance()).repeatMode = 1;
          break;
        case Repeat.ALL:
          _throw(getInstance()).repeatMode = 2;
          break;
      }
    },
    setShuffle: (shuffle) => (_throw(getInstance()).shuffleMode = shuffle ? 1 : 0),
  },
  controls: () =>
    createDefaultControls(AppleMusic, {
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
      ratingSystem: RatingSystem.NONE,
      canSetState: getInstance()?.capabilities?.canPause ?? false,
      canSkipPrevious: getInstance()?.capabilities?.canSkipToPreviousItem ?? false,
      canSkipNext: getInstance()?.capabilities?.canSkipToNextItem ?? false,
      canSetPosition: getInstance()?.capabilities?.canSeek ?? false,
      canSetVolume: getInstance()?.capabilities?.canSetVolume ?? false,
      canSetRating: false,
      canSetRepeat: getInstance()?.capabilities?.canSetRepeatMode ?? false,
      canSetShuffle: getInstance()?.capabilities?.canSetShuffleMode ?? false,
    }),
};

export default AppleMusic;
