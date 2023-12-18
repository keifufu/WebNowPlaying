import { EventError, Repeat, Site, StateMode } from "../../../types";
import { createDefaultControls, createSiteInfo } from "../utils";

const getPlayer = () => (window as any)?.getAudioPlayer();
const getPlayerThrow = () => {
  const player = getPlayer();
  if (player) return player;
  throw new EventError();
};

const VK: Site = {
  init: null,
  ready: () => !!getPlayer(),
  info: createSiteInfo({
    name: () => "VK",
    title: () => unescape(getPlayer()?.stats?.currentAudio?.title ?? ""),
    artist: () => unescape(getPlayer()?.stats?.currentAudio?.performer ?? ""),
    album: () => "", // Apparently no way to get the album
    cover: () => getPlayer()?.stats?.currentAudio?.coverUrl_p ?? "",
    state: () => (!getPlayer()?.getCurrentPlaylist() ? StateMode.STOPPED : getPlayer().isPlaying() ? StateMode.PLAYING : StateMode.PAUSED),
    position: () => (getPlayer()?.getCurrentProgress() ?? 0) * VK.info.duration(),
    duration: () => getPlayer()?.stats?.currentAudio?.duration ?? 0,
    volume: () => (getPlayer()?.getVolume() ?? 1) ** (1 / 3) * 100,
    rating: () => 0,
    repeat: () => (getPlayer()?.isRepeatAll() ? Repeat.ALL : getPlayer()?.isRepeatCurrentAudio() ? Repeat.ONE : Repeat.NONE),
    shuffle: () => getPlayer()?.getPlaylistQueue()?.shuffled ?? false,
  }),
  events: {
    setState: (state) => {
      switch (state) {
        case StateMode.STOPPED:
          getPlayerThrow().stop();
          break;
        case StateMode.PAUSED:
          getPlayerThrow().pause();
          break;
        case StateMode.PLAYING:
          getPlayerThrow().play();
          break;
      }
    },
    skipPrevious: () => {
      getPlayerThrow().playPrev();
    },
    skipNext: () => {
      getPlayerThrow().playNext();
    },
    setPosition: (seconds) => {
      getPlayerThrow().seekToTime(seconds);
    },
    setVolume: (volume) => {
      getPlayerThrow().setVolume((volume / 100) ** 3);
    },
    setRating: null,
    setRepeat: (repeat) => {
      const player = getPlayerThrow();
      switch (repeat) {
        case Repeat.NONE:
          if (player.isRepeatCurrentAudio()) player.toggleRepeatCurrentAudio();
          if (player.isRepeatAll()) player.toggleRepeatAll();
          break;
        case Repeat.ALL:
          if (player.isRepeatCurrentAudio()) player.toggleRepeatCurrentAudio();
          if (!player.isRepeatAll()) player.toggleRepeatAll();
          break;
        case Repeat.ONE:
          if (player.isRepeatAll()) player.toggleRepeatAll();
          if (!player.isRepeatCurrentAudio()) player.toggleRepeatCurrentAudio();
          break;
      }
    },
    setShuffle: (shuffle) => {
      getPlayerThrow()?.getPlaylistQueue()?.shuffle(shuffle);
    },
  },
  controls: () =>
    createDefaultControls(VK, {
      availableRepeat: Repeat.NONE | Repeat.ALL | Repeat.ONE,
    }),
};

// https://stackoverflow.com/questions/18106164/unescape-apostrophe-39-in-javascript
function unescape(input: string) {
  return new DOMParser().parseFromString(input, "text/html").querySelector("html")!.textContent!;
}

export default VK;
