import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo } from "../utils";

// This only supports the collection player.
// Nobody listens to music on the other sites, hopefully.

const getPlayer = () => (window as any).collectionPlayer.player2;
const getPlayerThrow = () => {
  const player = getPlayer();
  if (player) return player;
  throw new EventError();
};

const Bandcamp: Site = {
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
      if (state === StateMode.STOPPED) return getPlayerThrow().stop();
      if (Bandcamp.info.state() === state) return;
      getPlayerThrow().playPause();
    },
    skipPrevious: () => {
      getPlayerThrow().prev();
    },
    skipNext: () => {
      getPlayerThrow().next();
    },
    setPosition: (seconds) => {
      getPlayerThrow().seeking(true);
      getPlayerThrow().position(seconds);
      getPlayerThrow().seeking(false);
    },
    setVolume: (volume) => {
      getPlayerThrow().volume(volume / 100);
    },
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
