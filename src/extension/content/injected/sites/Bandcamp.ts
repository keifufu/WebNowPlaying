import { Repeat, Site, StateMode } from "../../../types";
import { _throw, createDefaultControls, createSiteInfo } from "../utils";

// This only supports the collection player.
// Nobody listens to music on the other sites, hopefully.

const getPlayer = () => (window as any).collectionPlayer.player2;

const Bandcamp: Site = {
  debug: {
    getPlayer,
  },
  init: null,
  ready: () => !!document.querySelector("audio")?.src,
  info: createSiteInfo({
    name: () => "Bandcamp",
    title: () => getPlayer()?.currentTrack().trackData.title ?? "",
    artist: () => getPlayer()?.currentTrack().trackData.artist ?? "",
    album: () => getPlayer()?.currentTrack().title ?? "",
    cover: () => getPlayer()?.currentTrack().artURL ?? "",
    state: () =>
      getPlayer()?.currentState() === "playing" ? StateMode.PLAYING : getPlayer()?.currentState() === "paused" ? StateMode.PAUSED : StateMode.STOPPED,
    position: () => getPlayer()?.position() ?? 0,
    duration: () => getPlayer()?.duration() ?? 0,
    volume: () => getPlayer()?.volume() * 100 ?? 100,
    rating: () => 0,
    repeat: () => Repeat.NONE,
    shuffle: () => false,
  }),
  events: {
    setState: (state) => {
      if (state === StateMode.STOPPED) return _throw(getPlayer()?.stop)();
      if (Bandcamp.info.state() === state) return;
      _throw(getPlayer()?.playPause)();
    },
    skipPrevious: () => _throw(getPlayer()?.prev)(),
    skipNext: () => _throw(getPlayer()?.next)(),
    setPosition: (seconds) => {
      _throw(getPlayer()?.seeking)(true);
      _throw(getPlayer()?.position)(seconds);
      _throw(getPlayer()?.seeking)(false);
    },
    setVolume: (volume) => _throw(getPlayer()?.volume)(volume / 100),
    setRating: null,
    setRepeat: null,
    setShuffle: null,
  },
  controls: () =>
    createDefaultControls(Bandcamp, {
      canSkipPrevious: getPlayer()?.hasPrev(),
      canSkipNext: getPlayer()?.hasNext(),
    }),
};

export default Bandcamp;
